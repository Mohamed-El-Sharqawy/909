"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import type { SuggestedProduct } from "../types";
import {
  SUGGESTED_PRODUCTS_LIMIT,
  COLLECTION_FETCH_LIMIT,
  PARENT_COLLECTION_LIMIT,
  FEATURED_FALLBACK_LIMIT,
} from "../constants";

export function useSuggestedProducts(items: any[], isOpen: boolean) {
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchSuggested = async () => {
      try {
        const collectionIds = [...new Set(items.map((item) => item.collectionId).filter(Boolean))];
        const productIdsInCart = items.map((item) => item.productId);

        let products: SuggestedProduct[] = [];

        if (collectionIds.length > 0) {
          for (const collectionId of collectionIds.slice(0, 2)) {
            try {
              const collectionData = await apiGet<{ data: { parentId?: string } }>(`/api/collections/${collectionId}`);
              const parentId = collectionData.data?.parentId;

              const data = await apiGet<{ data: { data: SuggestedProduct[] } }>(
                `/api/products?limit=${COLLECTION_FETCH_LIMIT}&collectionId=${collectionId}&isActive=true`
              );
              const collectionProducts = (data.data?.data || []).filter(
                (p: SuggestedProduct) => !productIdsInCart.includes(p.id)
              );

              if (collectionProducts.length < SUGGESTED_PRODUCTS_LIMIT && parentId) {
                try {
                  const parentData = await apiGet<{ data: { data: SuggestedProduct[] } }>(
                    `/api/products?limit=${PARENT_COLLECTION_LIMIT}&collectionId=${parentId}&isActive=true`
                  );
                  const parentProducts = (parentData.data?.data || []).filter(
                    (p: SuggestedProduct) => !productIdsInCart.includes(p.id)
                  );
                  products.push(...collectionProducts, ...parentProducts);
                } catch {
                  products.push(...collectionProducts);
                }
              } else {
                products.push(...collectionProducts);
              }
            } catch {
              // Skip this collection on error
            }
          }

          const uniqueProducts = products.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
          products = uniqueProducts.slice(0, SUGGESTED_PRODUCTS_LIMIT);
        }

        if (products.length < SUGGESTED_PRODUCTS_LIMIT) {
          try {
            const data = await apiGet<{ data: { data: SuggestedProduct[] } }>(
              "/api/products?limit=4&isFeatured=true&isActive=true"
            );
            if (data.data?.data) {
              const featured = data.data.data.filter(
                (p: SuggestedProduct) => !productIdsInCart.includes(p.id) && !products.find((x) => x.id === p.id)
              );
              products = [...products, ...featured].slice(0, SUGGESTED_PRODUCTS_LIMIT);
            }
          } catch {
            // Ignore error
          }
        }

        setSuggestedProducts(products);
      } catch {
        try {
          const data = await apiGet<{ data: { data: SuggestedProduct[] } }>(
            `/api/products?limit=${FEATURED_FALLBACK_LIMIT}&isFeatured=true`
          );
          if (data.data?.data) {
            setSuggestedProducts(data.data.data.slice(0, SUGGESTED_PRODUCTS_LIMIT));
          }
        } catch {
          // Ignore
        }
      }
    };

    fetchSuggested();
  }, [isOpen, items]);

  return suggestedProducts;
}
