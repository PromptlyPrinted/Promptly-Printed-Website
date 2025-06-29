import type { Order, User } from '@prisma/client';
import {
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';

export type MetricPeriod = 'daily' | 'weekly' | 'monthly';
export type MetricTrend = 'up' | 'down' | 'neutral';

interface MetricData {
  current: number;
  previous: number;
  trend: MetricTrend;
  percentageChange: number;
}

export interface AdvancedMetrics {
  sales: Record<MetricPeriod, MetricData>;
  orders: Record<MetricPeriod, MetricData>;
  users: Record<MetricPeriod, MetricData>;
  averageOrderValue: Record<MetricPeriod, MetricData>;
}

function calculateTrend(
  current: number,
  previous: number
): { trend: MetricTrend; percentageChange: number } {
  if (previous === 0) return { trend: 'neutral', percentageChange: 0 };

  const percentageChange = ((current - previous) / previous) * 100;
  const trend: MetricTrend =
    percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral';

  return { trend, percentageChange: Math.abs(percentageChange) };
}

function filterOrdersByDateRange(orders: Order[], startDate: Date): Order[] {
  return orders.filter(
    (order) => order.createdAt >= startDate && order.createdAt <= new Date()
  );
}

function filterUsersByDateRange(users: User[], startDate: Date): User[] {
  return users.filter(
    (user) => user.createdAt >= startDate && user.createdAt <= new Date()
  );
}

export function calculateMetrics(
  orders: Order[],
  users: User[]
): AdvancedMetrics {
  const now = new Date();
  const metrics: AdvancedMetrics = {
    sales: {} as Record<MetricPeriod, MetricData>,
    orders: {} as Record<MetricPeriod, MetricData>,
    users: {} as Record<MetricPeriod, MetricData>,
    averageOrderValue: {} as Record<MetricPeriod, MetricData>,
  };

  // Calculate metrics for each period
  (['daily', 'weekly', 'monthly'] as const).forEach((period: MetricPeriod) => {
    // Define date ranges
    let currentStart: Date;
    let previousStart: Date;

    switch (period) {
      case 'daily':
        currentStart = startOfDay(now);
        previousStart = startOfDay(subDays(now, 1));
        break;
      case 'weekly':
        currentStart = startOfWeek(now);
        previousStart = startOfWeek(subWeeks(now, 1));
        break;
      case 'monthly':
        currentStart = startOfMonth(now);
        previousStart = startOfMonth(subMonths(now, 1));
        break;
    }

    // Current period data
    const currentOrders = filterOrdersByDateRange(orders, currentStart);
    const currentUsers = filterUsersByDateRange(users, currentStart);
    const currentSales = currentOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
    const currentAvgOrder =
      currentOrders.length > 0 ? currentSales / currentOrders.length : 0;

    // Previous period data
    const previousOrders = filterOrdersByDateRange(orders, previousStart);
    const previousUsers = filterUsersByDateRange(users, previousStart);
    const previousSales = previousOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
    const previousAvgOrder =
      previousOrders.length > 0 ? previousSales / previousOrders.length : 0;

    // Calculate trends
    metrics.sales[period] = {
      current: currentSales,
      previous: previousSales,
      ...calculateTrend(currentSales, previousSales),
    };

    metrics.orders[period] = {
      current: currentOrders.length,
      previous: previousOrders.length,
      ...calculateTrend(currentOrders.length, previousOrders.length),
    };

    metrics.users[period] = {
      current: currentUsers.length,
      previous: previousUsers.length,
      ...calculateTrend(currentUsers.length, previousUsers.length),
    };

    metrics.averageOrderValue[period] = {
      current: currentAvgOrder,
      previous: previousAvgOrder,
      ...calculateTrend(currentAvgOrder, previousAvgOrder),
    };
  });

  return metrics;
}
