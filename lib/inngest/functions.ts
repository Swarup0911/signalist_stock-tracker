import { inngest } from '@/lib/inngest/client';
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
  PRICE_ALERT_EMAIL_PROMPT,
} from '@/lib/inngest/prompts';
import {
  sendNewsSummaryEmail,
  sendAiPriceAlertEmail,
  sendWelcomeEmail,
} from '@/lib/nodemailer';
import { getAllUsersForNewsEmail } from '@/lib/actions/user.actions';
import { getWatchlistSymbolsByEmail } from '@/lib/actions/watchlist.actions';
import { getNews, getStocksDetails } from '@/lib/actions/finnhub.actions';
import { formatPrice, getFormattedTodayDate } from '@/lib/utils';
import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';

export const sendSignUpEmail = inngest.createFunction(
  { id: 'sign-up-email' },
  { event: 'app/user.created' },
  async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt }
                        ]
                    }]
            }
        })

        await step.run('send-welcome-email', async () => {
            const part = response.candidates?.[0]?.content?.parts?.[0];
            const introText = (part && 'text' in part ? part.text : null) ||'Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.'

            const { data: { email, name } } = event;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
  { id: 'daily-news-summary' },
  [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }],
  async ({ step }) => {
        // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)

        if(!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: User; articles: MarketNewsArticle[] }> = [];
            for (const user of users as User[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        // Step #3: (placeholder) Summarize news via AI
        const userNewsSummaries: { user: User; newsContent: string | null }[] = [];

        for (const { user, articles } of results) {
                try {
                    const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                    const response = await step.ai.infer(`summarize-news-${user.email}`, {
                        model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                        body: {
                            contents: [{ role: 'user', parts: [{ text:prompt }]}]
                        }
                    });

                    const part = response.candidates?.[0]?.content?.parts?.[0];
                    const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'

                    userNewsSummaries.push({ user, newsContent });
                } catch (e) {
                    console.error('Failed to summarize news for : ', user.email);
                    userNewsSummaries.push({ user, newsContent: null });
                }
            }

        // Step #4: (placeholder) Send the emails
        await step.run('send-news-emails', async () => {
                await Promise.all(
                    userNewsSummaries.map(async ({ user, newsContent}) => {
                        if(!newsContent) return false;

                        return await sendNewsSummaryEmail({ email: user.email, date: getFormattedTodayDate(), newsContent })
                    })
                )
            })

        return { success: true, message: 'Daily news summary emails sent successfully' }
  }
)

export const checkPriceAlerts = inngest.createFunction(
  { id: 'check-price-alerts' },
  // Every day at 09:00 (server time)
  [{ cron: '0 9 * * *' }],
  async ({ step }) => {
    await connectToDatabase();

    let checked = 0;
    let triggered = 0;
    let emailed = 0;
    let failed = 0;

    const alerts = await step.run('load-alerts', async () => {
      return Alert.find({ active: true }).lean();
    });

    for (const alert of alerts as any[]) {
      await step.run(`check-alert-${alert._id}`, async () => {
        checked += 1;
        try {
          const stockData = await getStocksDetails(alert.symbol);
          const current = stockData.currentPrice;

          const isTriggered =
            alert.alertType === 'upper'
              ? current >= alert.threshold
              : current <= alert.threshold;

          if (!isTriggered) return;
          triggered += 1;

          const mongoose = await import('mongoose');
          const db = mongoose.default.connection.db;
          if (!db) return;

          const user = await db
            .collection('user')
            .findOne<{ email?: string }>({ id: alert.userId });

          if (!user?.email) return;

          const now = new Date();
          const timestamp = now.toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          const emailParams = {
            email: user.email,
            symbol: alert.symbol,
            company: alert.company,
            currentPrice: formatPrice(current),
            targetPrice: formatPrice(alert.threshold),
            timestamp,
          };

          const direction =
            alert.alertType === 'upper' ? 'Price Above Target' : 'Price Below Target';
          const operator = alert.alertType === 'upper' ? '>' : '<';

          const prompt = PRICE_ALERT_EMAIL_PROMPT
            .replace(/{{symbol}}/g, emailParams.symbol)
            .replace(/{{company}}/g, emailParams.company)
            .replace(/{{currentPrice}}/g, emailParams.currentPrice)
            .replace(/{{targetPrice}}/g, emailParams.targetPrice)
            .replace(/{{direction}}/g, direction)
            .replace(/{{operator}}/g, operator);

          let html =
            `<body><p>Price alert triggered for ${emailParams.symbol}: current price ${emailParams.currentPrice}, target ${emailParams.targetPrice}.</p></body>`;

          try {
            const response = await step.ai.infer(
              `price-alert-email-${alert._id}`,
              {
                model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                body: {
                  contents: [
                    {
                      role: 'user',
                      parts: [{ text: prompt }],
                    },
                  ],
                },
              }
            );

            const part = response.candidates?.[0]?.content?.parts?.[0];
            const aiHtml =
              part && 'text' in part ? (part.text as string) : null;
            if (aiHtml) html = aiHtml;
          } catch (e) {
            // If AI generation fails, fall back to simple HTML and still send the email.
            console.error('price-alert AI generation failed:', e);
          }

          const subject =
            alert.alertType === 'upper'
              ? `📈 Price Alert: ${emailParams.symbol} is above ${emailParams.targetPrice}`
              : `📉 Price Alert: ${emailParams.symbol} is below ${emailParams.targetPrice}`;

          await step.run(`send-alert-email-${alert._id}`, async () => {
            return await sendAiPriceAlertEmail({
              email: emailParams.email,
              subject,
              html,
            });
          });

          emailed += 1;

          // Only deactivate after a successful send
          await Alert.updateOne({ _id: alert._id }, { $set: { active: false } });
        } catch (e) {
          failed += 1;
          console.error('check-price-alerts error for', alert.symbol, e);
        }
      });
    }

    return { success: true, checked, triggered, emailed, failed };
  }
)