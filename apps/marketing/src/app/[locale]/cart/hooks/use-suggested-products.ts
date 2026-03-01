"use client";

import { useState, useEffect } from "react";
import type { Product } from "@ecommerce/shared-types";
import { apiPost } from "@/lib/api-client";
import { SUGGESTED_PRODUCTS_LIMIT } from "../constants";

interface CartItem {
  productId: string;
  collectionId?: string;
}

export function useSuggestedProducts(items: CartItem[]) {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        // Get unique collection IDs and product IDs from cart items
        const collectionIds = [...new Set(items.map((item) => item.collectionId).filter(Boolean))] as string[];
        const excludeProductIds = items.map((item) => item.productId).filter(Boolean) as string[];

        // Use the related products endpoint
        const response = await apiPost<{ data: Product[] }>("/api/products/related", {
          collectionIds,
          excludeProductIds,
          limit: SUGGESTED_PRODUCTS_LIMIT,
        });

        if (response.data) {
          setSuggestedProducts(response.data);
        }
      } catch {
        // Silently fail - suggested products are not critical
        setSuggestedProducts([]);
      }
    };

    fetchSuggested();
  }, [items]);

  return suggestedProducts;
}
