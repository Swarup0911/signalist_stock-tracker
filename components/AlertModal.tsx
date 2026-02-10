'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALERT_TYPE_OPTIONS } from '@/lib/constants';
import { createAlert, updateAlert } from '@/lib/actions/alerts.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AlertModal({
  alertData,
  open,
  setOpen,
  watchlist,
}: AlertModalProps) {
  const [form, setForm] = React.useState<AlertData>(
    alertData || {
      symbol: '',
      company: '',
      alertName: '',
      alertType: 'upper',
      threshold: '',
    }
  );
  const [submitting, setSubmitting] = React.useState(false);
  const router = useRouter();

  const hasPreselectedStock = Boolean(alertData?.symbol);

  React.useEffect(() => {
    if (alertData) {
      setForm(alertData);
    }
  }, [alertData]);

  const handleSubmit = async () => {
    if (!form.symbol || !form.company || !form.threshold) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    const isEdit = Boolean(alertId);
    const result = isEdit
      ? await updateAlert(alertId!, form)
      : await createAlert(form);
    setSubmitting(false);

    if (result.success) {
      toast.success(isEdit ? 'Alert updated successfully' : 'Alert created successfully');
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || 'Failed to create alert');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="alert-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="alert-title">
            Create Price Alert
          </AlertDialogTitle>
          <AlertDialogDescription>
            Get an email when this stock crosses your target price.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {hasPreselectedStock || !watchlist ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="form-label">Symbol</label>
                <Input
                  value={form.symbol}
                  readOnly
                  className="form-input"
                />
              </div>
              <div className="flex-[2]">
                <label className="form-label">Company</label>
                <Input
                  value={form.company}
                  readOnly
                  className="form-input"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="form-label">Stock</label>
              <Select
                value={form.symbol}
                onValueChange={(symbol) => {
                  const found = watchlist?.find((s) => s.symbol === symbol);
                  setForm((prev) => ({
                    ...prev,
                    symbol,
                    company: found?.company || prev.company,
                  }));
                }}
              >
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Select a stock" />
                </SelectTrigger>
                <SelectContent>
                  {watchlist?.map((stock) => (
                    <SelectItem key={stock.symbol} value={stock.symbol}>
                      {stock.company} ({stock.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={form.company}
                readOnly
                className="form-input mt-2"
                placeholder="Company"
              />
            </div>
          )}

          <div>
            <label className="form-label">Alert name</label>
            <Input
              className="form-input"
              placeholder="e.g. Take profit at $250"
              value={form.alertName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, alertName: e.target.value }))
              }
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="form-label">Condition</label>
              <Select
                value={form.alertType}
                onValueChange={(val: 'upper' | 'lower') =>
                  setForm((prev) => ({ ...prev, alertType: val }))
                }
              >
                <SelectTrigger className="select-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="form-label">Target price (USD)</label>
              <Input
                className="form-input"
                type="number"
                min={0}
                step="0.01"
                value={form.threshold}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, threshold: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Alert'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

