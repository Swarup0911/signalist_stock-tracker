'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../better-auth/auth';
import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { getStocksDetails } from './finnhub.actions';

export const createAlert = async (data: AlertData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    await Alert.create({
      userId: session.user.id,
      symbol: data.symbol.toUpperCase(),
      company: data.company.trim(),
      alertName: data.alertName.trim() || `${data.symbol.toUpperCase()} Alert`,
      alertType: data.alertType,
      threshold: Number(data.threshold),
    });

    revalidatePath('/watchlist');

    return { success: true, message: 'Alert created successfully' };
  } catch (error) {
    console.error('createAlert error:', error);
    return { success: false, message: 'Failed to create alert' };
  }
};

export const getUserAlerts = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    const rawAlerts = await Alert.find({
      userId: session.user.id,
      active: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const alertsWithData = await Promise.all(
      rawAlerts.map(async (a) => {
        try {
          const stock = await getStocksDetails(a.symbol);
          return {
            ...a,
            currentPrice: stock.currentPrice,
            changePercent: stock.changePercent,
          };
        } catch {
          return a;
        }
      })
    );

    return JSON.parse(JSON.stringify(alertsWithData)) as Alert[];
  } catch (error) {
    console.error('getUserAlerts error:', error);
    return [];
  }
};

export const updateAlert = async (alertId: string, data: AlertData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    await Alert.updateOne(
      { _id: alertId, userId: session.user.id },
      {
        $set: {
          alertName: data.alertName.trim() || `${data.symbol.toUpperCase()} Alert`,
          alertType: data.alertType,
          threshold: Number(data.threshold),
        },
      }
    );

    revalidatePath('/watchlist');

    return { success: true, message: 'Alert updated successfully' };
  } catch (error) {
    console.error('updateAlert error:', error);
    return { success: false, message: 'Failed to update alert' };
  }
};

export const deleteAlert = async (alertId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    await connectToDatabase();

    await Alert.deleteOne({ _id: alertId, userId: session.user.id });
    revalidatePath('/watchlist');

    return { success: true, message: 'Alert deleted successfully' };
  } catch (error) {
    console.error('deleteAlert error:', error);
    return { success: false, message: 'Failed to delete alert' };
  }
};

