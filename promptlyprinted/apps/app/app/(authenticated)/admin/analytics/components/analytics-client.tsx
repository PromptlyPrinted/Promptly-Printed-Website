"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Analytics } from "@prisma/client";
import { DataTable } from "@/components/ui/data-table";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Script from "next/script";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    posthog: {
      init: (key: string, config: any) => void;
      capture: (event: string, properties?: any) => void;
      identify: (id: string | number, properties?: any) => void;
      people: {
        set: (properties: any) => void;
      };
    };
  }
}

interface AnalyticsClientProps {
  initialData: Analytics[];
  uniqueEventNames: string[];
}

export default function AnalyticsClient({ 
  initialData,
  uniqueEventNames,
}: AnalyticsClientProps) {
  const [filteredData, setFilteredData] = useState<Analytics[]>(initialData);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Track page view on component mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      window.gtag('event', 'page_view', {
        page_title: 'Analytics Dashboard',
        page_path: '/admin/analytics',
      });
    }

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      window.posthog.capture('page_view', {
        page: 'Analytics Dashboard',
        path: '/admin/analytics',
        total_records: initialData.length,
        unique_events: uniqueEventNames.length,
      });
    }
  }, [initialData.length, uniqueEventNames.length]);

  const trackFilterChange = (filterType: string, value: any) => {
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      window.gtag('event', 'filter_change', {
        event_category: 'Analytics',
        event_label: filterType,
        value: JSON.stringify(value),
      });
    }

    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      window.posthog.capture('filter_change', {
        filter_type: filterType,
        filter_value: value,
        current_records: filteredData.length,
      });
    }
  };

  const columns = [
    {
      accessorKey: "eventName",
      header: "Event Name",
    },
    {
      accessorKey: "userId",
      header: "User ID",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: { row: any }) => format(new Date(row.original.createdAt), "PPpp"),
    },
  ];

  useEffect(() => {
    const filtered = initialData.filter((item) => {
      const matchesEvent = !selectedEvent || item.eventName === selectedEvent;
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (new Date(item.createdAt) >= dateRange.from && 
         new Date(item.createdAt) <= dateRange.to);
      
      return matchesEvent && matchesDateRange;
    });
    setFilteredData(filtered);

    // Track filter results
    if (filtered.length !== initialData.length) {
      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        window.gtag('event', 'filter_results', {
          event_category: 'Analytics',
          event_label: 'Filter Applied',
          value: filtered.length,
          total_records: initialData.length,
          filter_event: selectedEvent,
          date_range: dateRange ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
          } : null,
        });
      }

      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        window.posthog.capture('filter_results', {
          filtered_count: filtered.length,
          total_count: initialData.length,
          reduction_percentage: ((initialData.length - filtered.length) / initialData.length) * 100,
          selected_event: selectedEvent,
          date_range: dateRange ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
          } : null,
        });
      }
    }
  }, [selectedEvent, dateRange, initialData]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>
      
      {/* External Analytics Scripts */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                page_path: '/admin/analytics',
                custom_map: {
                  dimension1: 'filter_type',
                  dimension2: 'filter_value',
                  metric1: 'filtered_count'
                }
              });
            `}
          </Script>
        </>
      )}
      
      {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
        <Script id="posthog-script" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}', {
              api_host: 'https://app.posthog.com',
              capture_pageview: true,
              capture_pageleave: true,
              autocapture: true
            });
          `}
        </Script>
      )}

      <div className="flex gap-4 mb-6">
        <div className="w-64">
          <Select
            value={selectedEvent || undefined}
            onValueChange={(value) => {
              setSelectedEvent(value);
              trackFilterChange('event', value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Event" />
            </SelectTrigger>
            <SelectContent>
              {uniqueEventNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DateRangePicker
          onChange={(range) => {
            setDateRange(range);
            trackFilterChange('date_range', range ? {
              from: range.from?.toISOString(),
              to: range.to?.toISOString(),
            } : null);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
      />
    </div>
  );
} 