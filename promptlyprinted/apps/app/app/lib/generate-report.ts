import { type AdvancedMetrics } from "./metrics";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

export function generateExcelReport(metrics: AdvancedMetrics): Buffer {
  const workbook = XLSX.utils.book_new();
  const periods = ["daily", "weekly", "monthly"] as const;

  // Create a worksheet for each period
  periods.forEach((period) => {
    const data = [
      ["Metric", "Current", "Previous", "Change"],
      [
        "Sales",
        metrics.sales[period].current.toFixed(2),
        metrics.sales[period].previous.toFixed(2),
        `${metrics.sales[period].trend === "up" ? "↑" : metrics.sales[period].trend === "down" ? "↓" : "="} ${metrics.sales[period].percentageChange.toFixed(1)}%`,
      ],
      [
        "Orders",
        metrics.orders[period].current,
        metrics.orders[period].previous,
        `${metrics.orders[period].trend === "up" ? "↑" : metrics.orders[period].trend === "down" ? "↓" : "="} ${metrics.orders[period].percentageChange.toFixed(1)}%`,
      ],
      [
        "Users",
        metrics.users[period].current,
        metrics.users[period].previous,
        `${metrics.users[period].trend === "up" ? "↑" : metrics.users[period].trend === "down" ? "↓" : "="} ${metrics.users[period].percentageChange.toFixed(1)}%`,
      ],
      [
        "Avg Order Value",
        metrics.averageOrderValue[period].current.toFixed(2),
        metrics.averageOrderValue[period].previous.toFixed(2),
        `${metrics.averageOrderValue[period].trend === "up" ? "↑" : metrics.averageOrderValue[period].trend === "down" ? "↓" : "="} ${metrics.averageOrderValue[period].percentageChange.toFixed(1)}%`,
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const colWidths = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
    worksheet['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, period.charAt(0).toUpperCase() + period.slice(1));
  });

  // Add a summary sheet
  const summaryData = [
    ["Promptly Printed - Analytics Report"],
    [`Generated on ${format(new Date(), "PPP")}`],
    [],
    ["Period", "Total Sales", "Total Orders", "Total Users", "Avg Order Value"],
    ...periods.map(period => [
      period.charAt(0).toUpperCase() + period.slice(1),
      metrics.sales[period].current.toFixed(2),
      metrics.orders[period].current,
      metrics.users[period].current,
      metrics.averageOrderValue[period].current.toFixed(2),
    ]),
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths for summary
  const summaryColWidths = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
  summarySheet['!cols'] = summaryColWidths;

  // Add the summary worksheet to the beginning
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
} 