import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SaveDesignInput, DesignResponse } from "@/types/design";

export function useDesigns() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const saveDesign = async (design: SaveDesignInput) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save design");
      }

      const savedDesign = await response.json();
      toast.success("Design saved successfully");
      router.refresh();
      return savedDesign;
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDesigns = async (productId?: number): Promise<DesignResponse[]> => {
    try {
      setIsLoading(true);
      const url = new URL("/api/designs", window.location.origin);
      if (productId) {
        url.searchParams.set("productId", productId.toString());
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch designs");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching designs:", error);
      toast.error("Failed to fetch designs");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveDesign,
    getDesigns,
  };
}
