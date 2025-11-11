import { prisma } from '@/lib/prisma';
import AnalyticsClient from './components/analytics-client';

async function getAnalytics() {
  const analytics = await prisma.analytics.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: true,
    },
  });

  const uniqueEventNames = [
    ...new Set(analytics.map((item) => item.eventName)),
  ];
  return { analytics, uniqueEventNames };
}

export default async function AnalyticsPage() {
  const { analytics, uniqueEventNames } = await getAnalytics();

  return (
    <AnalyticsClient
      initialData={analytics}
      uniqueEventNames={uniqueEventNames}
    />
  );
}
