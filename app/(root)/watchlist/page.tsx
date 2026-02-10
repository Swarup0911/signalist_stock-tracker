import { Star } from 'lucide-react';
import { getNews, searchStocks } from '@/lib/actions/finnhub.actions';
import SearchCommand from '@/components/SearchCommand';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';
import { getUserAlerts } from '@/lib/actions/alerts.actions';
import { WatchlistTable } from '@/components/WatchlistTable';
import CreateAlertButton from '@/components/CreateAlertButton';
import AlertsList from '@/components/AlertsList';

const Watchlist = async () => {
  const [watchlist, initialStocks, news, alerts] = await Promise.all([
    getWatchlistWithData(),
    searchStocks(),
    getNews(),
    getUserAlerts(),
  ]);

  // Empty state
  if (watchlist.length === 0) {
    return (
      <section className="flex watchlist-empty-container">
        <div className="watchlist-empty">
          <Star className="watchlist-star" />
          <h2 className="empty-title">Your watchlist is empty</h2>
          <p className="empty-description">
            Start building your watchlist by searching for stocks and clicking the star icon to add them.
          </p>
        </div>
        <SearchCommand initialStocks={initialStocks} />
      </section>
    );
  }

  return (
    <section className="container mt-6 space-y-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="watchlist-title">Watchlist</h2>
          <p className="text-sm text-gray-500">
            Track your favorite stocks and manage price alerts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchCommand label="Add Stock" initialStocks={initialStocks} />
          <CreateAlertButton watchlist={watchlist} />
        </div>
      </div>

      {/* Main content: watchlist table + alerts sidebar */}
      <div className="watchlist-container">
        <div className="watchlist">
          <WatchlistTable watchlist={watchlist} />
        </div>

        <aside className="watchlist-alerts">
          <div className="flex items-center justify-between mb-3">
            <h3 className="alert-title">Alerts</h3>
          </div>

          <div className="alert-list">
            <AlertsList alerts={alerts as Alert[]} watchlist={watchlist} />
          </div>
        </aside>
      </div>

      {/* News grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-100">News</h3>
        <div className="watchlist-news">
          {news?.map((article) => (
            <article key={article.id} className="news-item">
              {article.related && (
                <span className="news-tag">{article.related}</span>
              )}
              <h4 className="news-title">{article.headline}</h4>
              <div className="news-meta">
                <span className="mr-2">{article.source}</span>
              </div>
              <p className="news-summary">{article.summary}</p>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="news-cta"
                >
                  Read More →
                </a>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default Watchlist;
