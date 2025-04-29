import { z } from "zod";

// Schema for saving a new design
export const SaveDesignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  productId: z.number().int().positive("Product ID is required"),
});

export type SaveDesignInput = z.infer<typeof SaveDesignSchema>;

// Schema for design response
export const DesignResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  productId: z.number().nullable(),
  product: z.object({
    name: z.string(),
    sku: z.string(),
    color: z.array(z.string()),
  }).nullable(),
});

export type DesignResponse = z.infer<typeof DesignResponseSchema>;

// Schema for reusing a design
export const ReuseDesignSchema = z.object({
  designId: z.string(),
  targetProductId: z.number().int().positive(),
});

export type ReuseDesignInput = z.infer<typeof ReuseDesignSchema>;
