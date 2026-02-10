'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertModal } from '@/components/AlertModal';

type CreateAlertButtonProps = {
  watchlist: StockWithData[];
};

const CreateAlertButton = ({ watchlist }: CreateAlertButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="yellow-btn h-10 px-4 py-2 text-sm"
        onClick={() => setOpen(true)}
      >
        Create Alert
      </Button>
      <AlertModal
        open={open}
        setOpen={setOpen}
        watchlist={watchlist}
        alertData={{
          symbol: '',
          company: '',
          alertName: '',
          alertType: 'upper',
          threshold: '',
        }}
      />
    </>
  );
};

export default CreateAlertButton;

