"use client";

import { useState, useEffect } from "react";
import type { Product } from "@ecommerce/shared-types";
import { apiGet } from "@/lib/api-client";
import { SUGGESTED_PRODUCTS_LIMIT, COLLECTION_FETCH_LIMIT, FEATURED_FALLBACK_LIMIT } from "../constants";

interface CartItem {
  productId: string;
  collectionId?: string;
}

export function useSuggestedProducts(items: CartItem[]) {
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const collectionIds = [...new Set(items.map((item) => item.collectionId).filter(Boolean))];
        const productIdsInCart = items.map((item) => item.productId);
        
        let products: Product[] = [];
        
        if (collectionIds.length > 0) {
          for (const collectionId of collectionIds.slice(0, 2)) {
            try {
              const collectionData = await apiGet<{ data: { parentId?: string } }>(`/api/collections/${collectionId}`);
              const parentId = collectionData.data?.parentId;
              
              const data = await apiGet<{ data: { data: Product[] } }>(`/api/products?limit=${COLLECTION_FETCH_LIMIT}&collectionId=${collectionId}&isActive=true`);
              const collectionProducts = (data.data?.data || []).filter((p: Product) => !productIdsInCart.includes(p.id));
              
              if (collectionProducts.length < SUGGESTED_PRODUCTS_LIMIT && parentId) {
                try {
                  const parentData = await apiGet<{ data: { data: Product[] } }>(`/api/products?limit=8&collectionId=${parentId}&isActive=true`);
                  const parentProducts = (parentData.data?.data || []).filter((p: Product) => !productIdsInCart.includes(p.id));
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
            const data = await apiGet<{ data: { data: Product[] } }>("/api/products?limit=6&isFeatured=true&isActive=true");
            if (data.data?.data) {
              const featured = data.data.data.filter((p: Product) => !productIdsInCart.includes(p.id) && !products.find((x) => x.id === p.id));
              products = [...products, ...featured].slice(0, SUGGESTED_PRODUCTS_LIMIT);
            }
          } catch {
            // Ignore error
          }
        }
        
        setSuggestedProducts(products);
      } catch {
        try {
          const data = await apiGet<{ data: { data: Product[] } }>(`/api/products?limit=${FEATURED_FALLBACK_LIMIT}&isFeatured=true`);
          if (data.data?.data) {
            setSuggestedProducts(data.data.data);
          }
        } catch {
          // Ignore
        }
      }
    };
    
    fetchSuggested();
  }, [items]);

  return suggestedProducts;
}
