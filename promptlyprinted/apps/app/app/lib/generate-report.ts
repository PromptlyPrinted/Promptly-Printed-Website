import { type AdvancedMetrics } from "./metrics";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generatePDFReport(metrics: AdvancedMetrics): string {
  const doc = new jsPDF();
  const now = new Date();
  
  // Title
  doc.setFontSize(20);
  doc.text("Promptly Printed - Analytics Report", 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated on ${format(now, "PPP")}`, 20, 30);

  // Metrics Tables
  const periods = ["daily", "weekly", "monthly"] as const;
  let yOffset = 40;

  periods.forEach((period) => {
    doc.setFontSize(16);
    doc.text(`${period.charAt(0).toUpperCase() + period.slice(1)} Metrics`, 20, yOffset);
    
    const data = [
      ["Metric", "Current", "Previous", "Change"],
      [
        "Sales",
        `$${metrics.sales[period].current.toFixed(2)}`,
        `$${metrics.sales[period].previous.toFixed(2)}`,
        `${metrics.sales[period].trend === "up" ? "↑" : metrics.sales[period].trend === "down" ? "↓" : "="} ${metrics.sales[period].percentageChange.toFixed(1)}%`,
      ],
      [
        "Orders",
        metrics.orders[period].current.toString(),
        metrics.orders[period].previous.toString(),
        `${metrics.orders[period].trend === "up" ? "↑" : metrics.orders[period].trend === "down" ? "↓" : "="} ${metrics.orders[period].percentageChange.toFixed(1)}%`,
      ],
      [
        "Users",
        metrics.users[period].current.toString(),
        metrics.users[period].previous.toString(),
        `${metrics.users[period].trend === "up" ? "↑" : metrics.users[period].trend === "down" ? "↓" : "="} ${metrics.users[period].percentageChange.toFixed(1)}%`,
      ],
      [
        "Avg Order Value",
        `$${metrics.averageOrderValue[period].current.toFixed(2)}`,
        `$${metrics.averageOrderValue[period].previous.toFixed(2)}`,
        `${metrics.averageOrderValue[period].trend === "up" ? "↑" : metrics.averageOrderValue[period].trend === "down" ? "↓" : "="} ${metrics.averageOrderValue[period].percentageChange.toFixed(1)}%`,
      ],
    ];

    doc.autoTable({
      startY: yOffset + 10,
      head: [data[0]],
      body: data.slice(1),
      theme: "grid",
      styles: {
        cellPadding: 5,
        fontSize: 10,
      },
      headStyles: {
        fillColor: [66, 66, 66],
      },
    });

    yOffset = (doc as any).lastAutoTable.finalY + 20;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(10);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc.output("datauristring");
} 