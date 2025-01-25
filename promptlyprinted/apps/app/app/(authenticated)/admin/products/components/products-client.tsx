"use client";

import { useState } from "react";
import { Button } from "@repo/design-system/components/ui/button";
import { Card } from "@repo/design-system/components/ui/card";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@repo/design-system/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Toggle } from "@repo/design-system/components/ui/toggle";
import { LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product, Category } from "@prisma/client";

const PRODUCT_TYPES = [
  'T-SHIRT',
  'HOODIE',
  'PET_APPAREL',
  'PET_ACCESSORY',
  'PET_BED',
  'TEMPORARY_TATTOO',
  'HARDCOVER_BOOK',
  'SOFTCOVER_BOOK',
  'PHOTO_BOOK',
  'COMIC_BOOK',
  'CHILDREN_BOOK',
  'ART_BOOK',
  'COFFEE_TABLE_BOOK'
];

type ViewMode = "table" | "grid";

type ProductWithBasicInfo = {
  id: number;
  name: string;
  sku: string;
  customerPrice: number;
  shippingCost: number;
  currency: string;
  stock: number;
  listed: boolean;
  productType: string;
  categoryId: number | null;
  countryCode: string;
  category: {
    id: number;
    name: string;
  } | null;
  images: {
    url: string;
  }[];
};

type CategoryWithBasicInfo = {
  id: number;
  name: string;
};

interface ProductsClientProps {
  initialProducts?: ProductWithBasicInfo[];
  categories?: CategoryWithBasicInfo[];
  currentPage: number;
  totalPages: number;
  countries: string[];
  selectedCountry: string;
}

export function ProductsClient({
  initialProducts = [],
  categories = [],
  currentPage,
  totalPages,
  countries,
  selectedCountry,
}: ProductsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showListed, setShowListed] = useState<string>("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Filter logic
  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category?.name === selectedCategory;

    const matchesType =
      selectedType === "all" || product.productType === selectedType;

    const matchesListed =
      showListed === "all" ||
      (showListed === "listed" && product.listed) ||
      (showListed === "unlisted" && !product.listed);

    const matchesPriceRange =
      (priceRange.min === "" || product.customerPrice >= Number(priceRange.min)) &&
      (priceRange.max === "" || product.customerPrice <= Number(priceRange.max));

    const matchesCountry =
      selectedCountry === "all" || product.countryCode === selectedCountry;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesType &&
      matchesListed &&
      matchesPriceRange &&
      matchesCountry
    );
  });

  const goToPage = (page: number) => {
    router.push(`/admin/products?page=${page}&country=${selectedCountry}`);
  };

  const changeCountry = (country: string) => {
    router.push(`/admin/products?page=1&country=${country}`);
  };

  return (
    <div className="space-y-4">
      {/* Filter + controls row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left side: country + search + category + productType + listed */}
        <div className="flex flex-1 items-center space-x-2">
          <Select
            value={selectedCountry}
            onValueChange={changeCountry}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[300px]"
          />
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Product Type Filter */}
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Product Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PRODUCT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Listed/unlisted */}
          <Select value={showListed} onValueChange={setShowListed}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Listed Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="listed">Listed Only</SelectItem>
              <SelectItem value="unlisted">Unlisted Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Right side: toggle + add product button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 rounded-md border">
            <Toggle
              pressed={viewMode === "table"}
              onPressedChange={() => setViewMode("table")}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Toggle>
          </div>
          <Button onClick={() => router.push("/admin/products/new")}>
            Add Product
          </Button>
        </div>
      </div>

      {/* TABLE view */}
      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                {/* ADDED: Shipping column */}
                <TableHead>Shipping</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const catName =
                  categories.find((c) => c.id === product.categoryId)?.name ||
                  "—";
                return (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{catName}</TableCell>
                    <TableCell>
                      {product.productType || "—"}
                    </TableCell>
                    <TableCell>
                      {product.currency} {product.customerPrice.toFixed(2)}
                    </TableCell>
                    {/* Show shipping cost */}
                    <TableCell>
                      {product.currency} {product.shippingCost.toFixed(2)}
                    </TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.listed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.listed ? "Listed" : "Unlisted"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          router.push(`/admin/products/${product.id}`)
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t px-4 py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // GRID view
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const catName =
              categories.find((c) => c.id === product.categoryId)?.name || "—";
            return (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg"
                onClick={() => router.push(`/admin/products/${product.id}`)}
              >
                <div className="p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {catName} | {product.productType || "—"}
                  </p>
                  <div className="mt-2 space-y-1">
                    {/* price */}
                    <p className="text-lg font-bold">
                      {product.currency} {product.customerPrice.toFixed(2)}
                    </p>
                    {/* shipping */}
                    <p className="text-sm text-gray-600">
                      Shipping: {product.currency} {product.shippingCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm">
                      Stock: {product.stock}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.listed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.listed ? "Listed" : "Unlisted"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500">
              No products found.
            </div>
          )}
          
          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}