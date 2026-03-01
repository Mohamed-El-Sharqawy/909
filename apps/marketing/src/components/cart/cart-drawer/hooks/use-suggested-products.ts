"use client";

import { useState, useEffect } from "react";
import { apiPost } from "@/lib/api-client";
import type { SuggestedProduct } from "../types";
import { SUGGESTED_PRODUCTS_LIMIT } from "../constants";

export function useSuggestedProducts(items: any[], isOpen: boolean) {
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSuggested = async () => {
      try {
        // Get unique collection IDs and product IDs from cart items
        const collectionIds = [...new Set(items.map((item) => item.collectionId).filter(Boolean))] as string[];
        const excludeProductIds = items.map((item) => item.productId).filter(Boolean) as string[];

        // Use the new related products endpoint
        const response = await apiPost<{ data: SuggestedProduct[] }>("/api/products/related", {
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
  }, [isOpen, items]);

  return suggestedProducts;
}
