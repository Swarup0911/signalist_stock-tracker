'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteAlert } from '@/lib/actions/alerts.actions';
import { getAlertText, formatPrice, getChangeColorClass, cn } from '@/lib/utils';
import { AlertModal } from '@/components/AlertModal';
import { Button } from '@/components/ui/button';

type AlertsListProps = {
  alerts: Alert[];
  watchlist: StockWithData[];
};

const AlertsList = ({ alerts, watchlist }: AlertsListProps) => {
  const router = useRouter();
  const [editing, setEditing] = useState<Alert | null>(null);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (alert: Alert) => {
    const id = (alert as any)._id ?? alert.id;
    if (!id) return;
    setIsDeleting(String(id));
    const res = await deleteAlert(String(id));
    setIsDeleting(null);
    if (res.success) {
      router.refresh();
    }
  };

  const handleEdit = (alert: Alert) => {
    setEditing(alert);
    setOpen(true);
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert-empty">
        No alerts yet. Create an alert to get notified when a stock
        hits your target price.
      </div>
    );
  }

  return (
    <>
      {alerts.map((alert) => {
        const key = (alert as any)._id ?? alert.id ?? `${alert.symbol}-${alert.threshold}`;
        return (
          <div key={key} className="alert-item">
            <div className="alert-details">
              <div>
                <div className="alert-name">{alert.company}</div>
                <div className="text-sm text-gray-400">{alert.symbol}</div>
              </div>
              <div className="text-right">
                {typeof alert.currentPrice === 'number' && (
                  <div className="alert-price">
                    {formatPrice(alert.currentPrice)}
                  </div>
                )}
                {typeof alert.changePercent === 'number' && (
                  <div
                    className={cn(
                      'text-sm',
                      getChangeColorClass(alert.changePercent)
                    )}
                  >
                    {alert.changePercent > 0 ? '+' : ''}
                    {alert.changePercent.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>

            <div className="alert-actions">
              <p className="text-sm text-gray-400">
                Alert: <span className="font-semibold">{getAlertText(alert)}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="alert-update-btn"
                  onClick={() => handleEdit(alert)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="alert-delete-btn"
                  onClick={() => handleDelete(alert)}
                  disabled={isDeleting === ((alert as any)._id ?? alert.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {editing && (
        <AlertModal
          open={open}
          setOpen={(v) => {
            if (!v) setEditing(null);
            setOpen(v);
          }}
          alertId={(editing as any)._id ?? editing.id}
          alertData={{
            symbol: editing.symbol,
            company: editing.company,
            alertName: editing.alertName,
            alertType: editing.alertType,
            threshold: String(editing.threshold),
          }}
          watchlist={watchlist}
        />
      )}
    </>
  );
};

export default AlertsList;

