'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Category, type Product, ShippingMethod } from '@prisma/client';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Switch } from '@repo/design-system/components/ui/switch';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

interface ProdigiProduct {
  sku: string;
  description: string;
  productDimensions: {
    width: number;
    height: number;
    units: string;
  };
  attributes: {
    edge?: string[];
    frame?: string[];
    paperType?: string[];
    substrateWeight?: string[];
    wrap?: string[];
    [key: string]: string[] | undefined;
  };
  printAreas: {
    default: {
      required: boolean;
    };
    [key: string]: {
      required: boolean;
    };
  };
  variants: Array<{
    attributes: {
      edge?: string;
      frame?: string;
      paperType?: string;
      substrateWeight?: string;
      wrap?: string;
      [key: string]: string | undefined;
    };
    shipsTo: string[];
    printAreaSizes: {
      default: {
        horizontalResolution: number;
        verticalResolution: number;
      };
      [key: string]: {
        horizontalResolution: number;
        verticalResolution: number;
      };
    };
  }>;
}

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .refine((val) => /^[A-Z0-9-]+$/.test(val), {
      message: 'SKU must contain only uppercase letters, numbers, and hyphens',
    }),
  description: z.string().min(1, 'Description is required'),
  supplierPrice: z.number().min(0, 'Price must be positive'),
  customerPrice: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  listed: z.boolean(),
  categoryId: z
    .string()
    .min(1, 'Category is required')
    .refine((val) => ['PRINTS', 'FRAMES', 'CARDS'].includes(val), {
      message: 'Category must be one of: PRINTS, FRAMES, CARDS',
    }),
  productType: z.string().min(1, 'Product type is required'),
  prodigiSku: z.string().optional(),
  prodigiVariant: z.string().optional(),
  shippingMethod: z.nativeEnum(ShippingMethod).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prodigiProducts, setProdigiProducts] = useState<ProdigiProduct[]>([]);
  const [selectedProdigiProduct, setSelectedProdigiProduct] =
    useState<ProdigiProduct | null>(null);
  const [shippingQuotes, setShippingQuotes] = useState<
    Record<ShippingMethod, number>
  >({
    [ShippingMethod.BUDGET]: 0,
    [ShippingMethod.STANDARD]: 0,
    [ShippingMethod.EXPRESS]: 0,
    [ShippingMethod.OVERNIGHT]: 0,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          categoryId: initialData.categoryId?.toString(),
          supplierPrice: initialData.price,
          customerPrice: initialData.customerPrice,
        }
      : {
          name: '',
          sku: '',
          description: '',
          supplierPrice: 0,
          customerPrice: 0,
          currency: 'USD',
          stock: 0,
          listed: false,
          categoryId: '',
          productType: '',
        },
  });

  const { watch, setValue } = form;
  const supplierPrice = watch('supplierPrice');
  const customerPrice = watch('customerPrice');
  const margin = customerPrice - supplierPrice;
  const marginPercentage =
    supplierPrice > 0 ? ((margin / supplierPrice) * 100).toFixed(1) : '0';

  useEffect(() => {
    async function fetchProdigiProducts() {
      try {
        const response = await fetch('/api/admin/prodigi/products');
        const data = await response.json();

        if (!response.ok) {
          console.error('Prodigi API Error:', data);
          throw new Error(data.error || 'Failed to fetch Prodigi products');
        }

        if (!data.products) {
          console.error('Unexpected response format:', data);
          throw new Error('Invalid response format from Prodigi API');
        }

        setProdigiProducts(data.products);
      } catch (error) {
        console.error('Error fetching Prodigi products:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to load Prodigi products'
        );
      }
    }

    fetchProdigiProducts();
  }, []);

  async function fetchShippingQuotes(sku: string) {
    try {
      const response = await fetch('/api/shipping/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              sku,
              copies: 1,
              assets: [{ printArea: 'default' }],
            },
          ],
          destinationCountryCode: 'US', // Default to US for now
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipping quotes');
      }

      const data = await response.json();
      const quotes = {
        [ShippingMethod.BUDGET]: 0,
        [ShippingMethod.STANDARD]: 0,
        [ShippingMethod.EXPRESS]: 0,
        [ShippingMethod.OVERNIGHT]: 0,
      };

      // Extract shipping costs for each method
      Object.values(ShippingMethod).forEach((method) => {
        const quote = data.quotes.find(
          (q: any) => q.shipmentMethod.toUpperCase() === method
        );
        if (quote) {
          quotes[method] = Number.parseFloat(quote.costSummary.shipping.amount);
        }
      });

      setShippingQuotes(quotes);
    } catch (error) {
      console.error('Error fetching shipping quotes:', error);
      toast.error('Failed to fetch shipping quotes');
    }
  }

  async function onProdigiProductSelect(sku: string) {
    try {
      const response = await fetch(`/api/admin/prodigi/products?sku=${sku}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Prodigi API Error:', data);
        throw new Error(
          data.error || 'Failed to fetch Prodigi product details'
        );
      }

      if (!data.product) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from Prodigi API');
      }

      const product = data.product;
      setSelectedProdigiProduct(product);

      // Pre-fill form with Prodigi product details
      setValue('sku', product.sku);
      setValue('name', product.description);
      setValue('description', product.description);

      // Get the first variant's attributes for display
      const firstVariant = product.variants[0];
      if (firstVariant) {
        setValue('prodigiVariant', JSON.stringify(firstVariant.attributes));
      }

      setValue('prodigiSku', product.sku);

      // After setting product details, fetch shipping quotes
      await fetchShippingQuotes(sku);
    } catch (error) {
      console.error('Error fetching Prodigi product details:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to load Prodigi product details'
      );
    }
  }

  async function onSubmit(data: ProductFormValues) {
    try {
      setIsLoading(true);

      // First, get a fresh shipping quote
      const response = await fetch(
        `/api/admin/products${initialData ? `/${initialData.id}` : ''}`,
        {
          method: initialData ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            categoryId: Number.parseInt(data.categoryId),
            price: data.supplierPrice,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      router.refresh();
      router.push('/admin/products');
      toast.success(initialData ? 'Product updated' : 'Product created');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="prodigiSku"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Prodigi Product</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onProdigiProductSelect(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Prodigi product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {prodigiProducts.map((product) => (
                      <SelectItem key={product.sku} value={product.sku}>
                        {product.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a product from Prodigi to auto-fill details
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedProdigiProduct && (
            <FormField
              control={form.control}
              name="prodigiVariant"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Variant</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedProdigiProduct?.variants.map(
                        (
                          variant: ProdigiProduct['variants'][0],
                          index: number
                        ) => (
                          <SelectItem
                            key={index}
                            value={JSON.stringify(variant.attributes)}
                          >
                            {Object.entries(variant.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplierPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseFloat(e.target.value))
                    }
                  />
                </FormControl>
                <FormDescription
                  className={
                    margin > supplierPrice * 0.5 ? 'text-green-600' : ''
                  }
                >
                  Margin: {margin.toFixed(2)} ({marginPercentage}%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number.parseInt(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="canvas">Canvas</SelectItem>
                    <SelectItem value="framed">Framed Print</SelectItem>
                    <SelectItem value="poster">Poster</SelectItem>
                    <SelectItem value="phoneCase">Phone Case</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="listed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Listed</FormLabel>
                  <FormDescription>
                    Make this product visible in the store
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Method</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ShippingMethod).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value} (
                        {shippingQuotes[value]
                          ? `$${shippingQuotes[value].toFixed(2)}`
                          : 'Quote not available'}
                        )
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the default shipping method for this product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? 'Saving...'
            : initialData
              ? 'Save changes'
              : 'Create product'}
        </Button>
      </form>
    </Form>
  );
}
