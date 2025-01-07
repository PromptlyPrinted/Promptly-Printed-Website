import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Analytics } from "@prisma/client";
import AnalyticsClient from "./components/analytics-client";

async function getAnalytics() {
  const analytics = await prisma.analytics.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  const uniqueEventNames = [...new Set(analytics.map((item) => item.eventName))];
  return { analytics, uniqueEventNames };
}

export default async function AnalyticsPage() {
  const { analytics, uniqueEventNames } = await getAnalytics();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsClient 
        initialData={analytics} 
        uniqueEventNames={uniqueEventNames}
      />
    </Suspense>
  );
} 