import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Base Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "shippingCost",
    header: "Shipping",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("shippingCost"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "taxAmount",
    header: "Tax",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("taxAmount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalCost"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "customerPrice",
    header: "Retail Price",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("customerPrice"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: row.original.currency,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "countryCode",
    header: "Country",
  },
  {
    accessorKey: "fulfillmentCountryCode",
    header: "Fulfillment Country",
  },
  {
    accessorKey: "stock",
    header: "Stock",
  },
  {
    accessorKey: "listed",
    header: "Listed",
    cell: ({ row }) => {
      return row.getValue("listed") ? "Yes" : "No";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id.toString())}
            >
              Copy product ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/admin/products/${product.id}`}>View details</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 