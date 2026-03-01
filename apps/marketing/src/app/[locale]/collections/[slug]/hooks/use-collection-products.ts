"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Product } from "@ecommerce/shared-types";
import { apiGet } from "@/lib/api-client";
import { PRODUCTS_PER_PAGE, SORT_OPTIONS_DATA } from "../constants";
import type { ProductMeta } from "../types";

interface UseCollectionProductsOptions {
  slug: string;
  initialProducts: Product[];
  initialMeta: ProductMeta;
  sortOption: string;
  debouncedMinPrice: number;
  debouncedMaxPrice: number;
}

export function useCollectionProducts({
  slug,
  initialProducts,
  initialMeta,
  sortOption,
  debouncedMinPrice,
  debouncedMaxPrice,
}: UseCollectionProductsOptions) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);

  // Track previous values to detect what changed
  const prevSlugRef = useRef(slug);
  const prevSortRef = useRef(sortOption);
  const prevMinPriceRef = useRef(debouncedMinPrice);
  const prevMaxPriceRef = useRef(debouncedMaxPrice);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const fetchAbortController = useRef<AbortController | null>(null);

  // Sync products with initialProducts when slug changes (page navigation)
  useEffect(() => {
    if (prevSlugRef.current !== slug) {
      setProducts(initialProducts);
      setMeta(initialMeta);
      setIsLoading(false);
      prevSlugRef.current = slug;
      prevSortRef.current = sortOption;
      prevMinPriceRef.current = debouncedMinPrice;
      prevMaxPriceRef.current = debouncedMaxPrice;
    }
  }, [slug, initialProducts, initialMeta, sortOption, debouncedMinPrice, debouncedMaxPrice]);

  const buildQueryParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        limit: String(PRODUCTS_PER_PAGE),
        page: String(page),
        isActive: "true",
      });

      if (slug !== "all-products") {
        params.set("collectionSlug", slug);
      }

      if (debouncedMinPrice > 0) {
        params.set("minPrice", String(debouncedMinPrice));
      }
      if (debouncedMaxPrice < 5000) {
        params.set("maxPrice", String(debouncedMaxPrice));
      }

      const sort = SORT_OPTIONS_DATA[sortOption];
      if (sort) {
        params.set("sortBy", sort.sortBy);
        params.set("sortOrder", sort.sortOrder);
      }

      return params;
    },
    [slug, debouncedMinPrice, debouncedMaxPrice, sortOption]
  );

  const fetchProducts = useCallback(
    async (page: number, append = false) => {
      if (fetchAbortController.current) {
        fetchAbortController.current.abort();
      }
      fetchAbortController.current = new AbortController();

      setIsLoading(true);
      try {
        const params = buildQueryParams(page);
        const data = await apiGet<{ data: { data: Product[]; meta: ProductMeta } }>(
          `/api/products?${params}`,
          { signal: fetchAbortController.current.signal }
        );

        if (append) {
          setProducts((prev) => [...prev, ...(data?.data?.data ?? [])]);
        } else {
          setProducts(data?.data?.data ?? []);
        }
        setMeta(data?.data?.meta ?? initialMeta);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error fetching products:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [buildQueryParams, initialMeta]
  );

  // Fetch when filters change (sort, price) - but NOT on slug change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const sortChanged = prevSortRef.current !== sortOption;
    const minPriceChanged = prevMinPriceRef.current !== debouncedMinPrice;
    const maxPriceChanged = prevMaxPriceRef.current !== debouncedMaxPrice;

    prevSortRef.current = sortOption;
    prevMinPriceRef.current = debouncedMinPrice;
    prevMaxPriceRef.current = debouncedMaxPrice;

    if (sortChanged || minPriceChanged || maxPriceChanged) {
      fetchProducts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption, debouncedMinPrice, debouncedMaxPrice]);

  // Infinite scroll
  useEffect(() => {
    const currentRef = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && meta.page < meta.totalPages) {
          fetchProducts(meta.page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, meta.page, meta.totalPages]);

  return {
    products,
    meta,
    isLoading,
    loadMoreRef,
  };
}
