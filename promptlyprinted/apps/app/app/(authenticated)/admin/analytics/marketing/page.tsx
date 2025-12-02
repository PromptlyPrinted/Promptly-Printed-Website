'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';

interface AnalyticsData {
  period: {
    start: string;
    end: string;
  };
  overview: {
    totalDesigns: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    conversionRate: number;
  };
  designsBySource: Array<{
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    design_count: number;
    unique_users: number;
  }>;
  revenueBySource: Array<{
    utm_source: string | null;
    utm_medium: string | null;
    order_count: number;
    total_revenue: number;
    avg_order_value: number;
  }>;
  competitionBySource: Array<{
    utm_source: string | null;
    entry_count: number;
    verified_purchases: number;
  }>;
  dailyTrends: Array<{
    date: string;
    designs: number;
    orders: number;
    revenue: number;
  }>;
}

export default function MarketingAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const response = await fetch(
        `/api/admin/analytics/marketing?startDate=${startDate.toISOString()}&endDate=${now.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    // Prepare CSV data
    const rows = [
      ['Source', 'Medium', 'Campaign', 'Designs', 'Unique Users', 'Orders', 'Revenue', 'AOV', 'Conv Rate'],
    ];

    data.designsBySource.forEach((source) => {
      const revenue = data.revenueBySource.find(
        (r) => r.utm_source === source.utm_source && r.utm_medium === source.utm_medium
      );

      const convRate =
        source.design_count > 0 && revenue
          ? ((Number(revenue.order_count) / source.design_count) * 100).toFixed(2)
          : '0.00';

      rows.push([
        source.utm_source || 'Unknown',
        source.utm_medium || 'Unknown',
        source.utm_campaign || 'None',
        source.design_count.toString(),
        source.unique_users.toString(),
        revenue?.order_count.toString() || '0',
        revenue ? `£${revenue.total_revenue.toFixed(2)}` : '£0.00',
        revenue ? `£${revenue.avg_order_value.toFixed(2)}` : '£0.00',
        `${convRate}%`,
      ]);
    });

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Analytics</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAnalytics}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Marketing Analytics</h1>
          <p className="text-gray-600">
            Track performance across TikTok, Instagram, Meta Ads, and more
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        <Button
          variant={dateRange === '7d' ? 'default' : 'outline'}
          onClick={() => setDateRange('7d')}
          size="sm"
        >
          Last 7 Days
        </Button>
        <Button
          variant={dateRange === '30d' ? 'default' : 'outline'}
          onClick={() => setDateRange('30d')}
          size="sm"
        >
          Last 30 Days
        </Button>
        <Button
          variant={dateRange === '90d' ? 'default' : 'outline'}
          onClick={() => setDateRange('90d')}
          size="sm"
        >
          Last 90 Days
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalDesigns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Designs created from marketing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.overview.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.overview.conversionRate.toFixed(2)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{data.overview.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From marketing campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{data.overview.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Marketing Channel</CardTitle>
          <CardDescription>
            See which campaigns drive the most designs, orders, and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Source</th>
                  <th className="text-left p-2 font-medium">Medium</th>
                  <th className="text-left p-2 font-medium">Campaign</th>
                  <th className="text-right p-2 font-medium">Designs</th>
                  <th className="text-right p-2 font-medium">Users</th>
                  <th className="text-right p-2 font-medium">Orders</th>
                  <th className="text-right p-2 font-medium">Revenue</th>
                  <th className="text-right p-2 font-medium">AOV</th>
                  <th className="text-right p-2 font-medium">Conv %</th>
                </tr>
              </thead>
              <tbody>
                {data.designsBySource.map((source, idx) => {
                  const revenue = data.revenueBySource.find(
                    (r) =>
                      r.utm_source === source.utm_source && r.utm_medium === source.utm_medium
                  );

                  const convRate =
                    source.design_count > 0 && revenue
                      ? ((Number(revenue.order_count) / source.design_count) * 100).toFixed(2)
                      : '0.00';

                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <Badge variant="outline">{source.utm_source || 'Unknown'}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{source.utm_medium || 'Unknown'}</Badge>
                      </td>
                      <td className="p-2 text-sm">{source.utm_campaign || '-'}</td>
                      <td className="p-2 text-right font-medium">{source.design_count}</td>
                      <td className="p-2 text-right">{source.unique_users}</td>
                      <td className="p-2 text-right font-medium">
                        {revenue?.order_count || 0}
                      </td>
                      <td className="p-2 text-right font-medium">
                        £{revenue?.total_revenue.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-right">
                        £{revenue?.avg_order_value.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2 text-right">
                        <span
                          className={`font-medium ${
                            parseFloat(convRate) >= 5
                              ? 'text-green-600'
                              : parseFloat(convRate) >= 2
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {convRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Competition Entries */}
      {data.competitionBySource.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competition Entries by Source</CardTitle>
            <CardDescription>Which channels drive the most competition participation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Source</th>
                    <th className="text-right p-2 font-medium">Total Entries</th>
                    <th className="text-right p-2 font-medium">Verified Purchases</th>
                    <th className="text-right p-2 font-medium">Verification Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.competitionBySource.map((source, idx) => {
                    const verificationRate =
                      source.entry_count > 0
                        ? ((Number(source.verified_purchases) / Number(source.entry_count)) * 100).toFixed(
                            2
                          )
                        : '0.00';

                    return (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <Badge variant="outline">{source.utm_source || 'Unknown'}</Badge>
                        </td>
                        <td className="p-2 text-right font-medium">{source.entry_count}</td>
                        <td className="p-2 text-right">{source.verified_purchases}</td>
                        <td className="p-2 text-right">
                          <span className="font-medium text-green-600">{verificationRate}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
