import nodemailer from 'nodemailer';
import {
  WELCOME_EMAIL_TEMPLATE,
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  STOCK_ALERT_UPPER_EMAIL_TEMPLATE,
  STOCK_ALERT_LOWER_EMAIL_TEMPLATE,
} from '@/lib/nodemailer/templates';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  },
});

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace(
    '{{intro}}',
    intro
  );

  const mailOptions = {
    from: `"Signalist" <signalist@swarupswaraj>`,
    to: email,
    subject: `Welcome to Signalist - your stock market toolkit is ready!`,
    text: 'Thanks for joining Signalist',
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}): Promise<void> => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace('{{date}}', date).replace(
    '{{newsContent}}',
    newsContent
  );

  const mailOptions = {
    from: `"Signalist News" <signalist@swarupswaraj>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Signalist`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendUpperPriceAlertEmail = async (params: {
  email: string;
  symbol: string;
  company: string;
  currentPrice: string;
  targetPrice: string;
  timestamp: string;
}) => {
  const htmlTemplate = STOCK_ALERT_UPPER_EMAIL_TEMPLATE
    .replace(/{{symbol}}/g, params.symbol)
    .replace(/{{company}}/g, params.company)
    .replace(/{{currentPrice}}/g, params.currentPrice)
    .replace(/{{targetPrice}}/g, params.targetPrice)
    .replace(/{{timestamp}}/g, params.timestamp);

  const mailOptions = {
    from: `"Signalist Alerts" <signalist@swarupswaraj>`,
    to: params.email,
    subject: `📈 Price Alert: ${params.symbol} hit ${params.targetPrice}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendLowerPriceAlertEmail = async (params: {
  email: string;
  symbol: string;
  company: string;
  currentPrice: string;
  targetPrice: string;
  timestamp: string;
}) => {
  const htmlTemplate = STOCK_ALERT_LOWER_EMAIL_TEMPLATE
    .replace(/{{symbol}}/g, params.symbol)
    .replace(/{{company}}/g, params.company)
    .replace(/{{currentPrice}}/g, params.currentPrice)
    .replace(/{{targetPrice}}/g, params.targetPrice)
    .replace(/{{timestamp}}/g, params.timestamp);

  const mailOptions = {
    from: `"Signalist Alerts" <signalist@swarupswaraj>`,
    to: params.email,
    subject: `📉 Price Alert: ${params.symbol} hit ${params.targetPrice}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};

export const sendAiPriceAlertEmail = async (params: {
  email: string;
  subject: string;
  html: string;
}) => {
  const mailOptions = {
    from: `"Signalist Alerts" <signalist@swarupswaraj>`,
    to: params.email,
    subject: params.subject,
    html: params.html,
  };

  await transporter.sendMail(mailOptions);
};
