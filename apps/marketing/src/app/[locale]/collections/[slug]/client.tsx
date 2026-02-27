"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import type { Product, Collection } from "@ecommerce/shared-types";
import { ProductCardWithVariants } from "@/components/ui/product-card-with-variants";
import { ProductCardHorizontal } from "@/components/ui/product-card-horizontal";
import { ProductCardSkeleton, ProductCardHorizontalSkeleton } from "@/components/ui/product-card-skeleton";

interface CollectionPageClientProps {
  locale: string;
  slug: string;
  title: string;
  collections: Collection[];
  initialProducts: Product[];
  initialMeta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type SortOption = {
  value: string;
  label: string;
  sortBy: string;
  sortOrder: string;
};

type GridColumns = 1 | 2 | 3 | 4;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const SORT_OPTIONS_DATA: Record<string, { sortBy: string; sortOrder: string }> = {
  "featured": { sortBy: "isFeatured", sortOrder: "desc" },
  "best-selling": { sortBy: "createdAt", sortOrder: "desc" },
  "alpha-asc": { sortBy: "nameEn", sortOrder: "asc" },
  "alpha-desc": { sortBy: "nameEn", sortOrder: "desc" },
  "price-asc": { sortBy: "price", sortOrder: "asc" },
  "price-desc": { sortBy: "price", sortOrder: "desc" },
  "date-asc": { sortBy: "createdAt", sortOrder: "asc" },
  "date-desc": { sortBy: "createdAt", sortOrder: "desc" },
};

export function CollectionPageClient({
  locale,
  slug,
  title,
  collections,
  initialProducts,
  initialMeta,
}: CollectionPageClientProps) {
  const t = useTranslations("collection");
  const router = useRouter();
  const isArabic = locale === "ar";

  // URL-synced state with nuqs
  const [sortOption, setSortOption] = useQueryState("sort", parseAsString.withDefault("featured"));
  const [gridColumns, setGridColumns] = useQueryState("grid", parseAsInteger.withDefault(4));
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsInteger.withDefault(0));
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsInteger.withDefault(5000));

  // Debounced price values for fetching
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);

  // Navigate to collection page instead of using query param
  const navigateToCollection = (collectionSlug: string | null) => {
    setIsFilterOpen(false);
    if (collectionSlug) {
      router.push(`/collections/${collectionSlug}`);
    } else {
      router.push("/collections/all-products");
    }
  };

  // Local state (not URL-synced)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [isLoading, setIsLoading] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availability, setAvailability] = useState<"all" | "inStock" | "outOfStock">("all");
  
  // Track previous values to detect what changed
  const prevSlugRef = useRef(slug);
  const prevSortRef = useRef(sortOption);
  const prevMinPriceRef = useRef(debouncedMinPrice);
  const prevMaxPriceRef = useRef(debouncedMaxPrice);

  // Sync products with initialProducts when slug changes (page navigation)
  // Server already fetched the right products, just use them
  useEffect(() => {
    if (prevSlugRef.current !== slug) {
      // Slug changed via navigation - use server data directly, no client fetch needed
      setProducts(initialProducts);
      setMeta(initialMeta);
      setIsLoading(false);
      prevSlugRef.current = slug;
      // Reset filter refs to match new page defaults
      prevSortRef.current = sortOption;
      prevMinPriceRef.current = debouncedMinPrice;
      prevMaxPriceRef.current = debouncedMaxPrice;
    }
  }, [slug, initialProducts, initialMeta, sortOption, debouncedMinPrice, debouncedMaxPrice]);

  // Debounce price changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const fetchAbortController = useRef<AbortController | null>(null);

  const sortOptions: SortOption[] = [
    { value: "featured", label: isArabic ? "مميز" : "Featured", sortBy: "isFeatured", sortOrder: "desc" },
    { value: "best-selling", label: isArabic ? "الأكثر مبيعاً" : "Best selling", sortBy: "createdAt", sortOrder: "desc" },
    { value: "alpha-asc", label: isArabic ? "أبجدياً، أ-ي" : "Alphabetically, A-Z", sortBy: "nameEn", sortOrder: "asc" },
    { value: "alpha-desc", label: isArabic ? "أبجدياً، ي-أ" : "Alphabetically, Z-A", sortBy: "nameEn", sortOrder: "desc" },
    { value: "price-asc", label: isArabic ? "السعر، من الأقل للأعلى" : "Price, low to high", sortBy: "price", sortOrder: "asc" },
    { value: "price-desc", label: isArabic ? "السعر، من الأعلى للأقل" : "Price, high to low", sortBy: "price", sortOrder: "desc" },
    { value: "date-asc", label: isArabic ? "التاريخ، من الأقدم للأحدث" : "Date, old to new", sortBy: "createdAt", sortOrder: "asc" },
    { value: "date-desc", label: isArabic ? "التاريخ، من الأحدث للأقدم" : "Date, new to old", sortBy: "createdAt", sortOrder: "desc" },
  ];

  const buildQueryParams = useCallback((page: number) => {
    const params = new URLSearchParams({
      limit: "32",
      page: String(page),
      isActive: "true",
    });

    // Handle slug-based filters
    if (slug !== "all-products") {
      // Use collectionSlug - backend will include children's products
      params.set("collectionSlug", slug);
    }

    if (debouncedMinPrice > 0) {
      params.set("minPrice", String(debouncedMinPrice));
    }
    if (debouncedMaxPrice < 5000) {
      params.set("maxPrice", String(debouncedMaxPrice));
    }

    // Sort
    const sort = SORT_OPTIONS_DATA[sortOption];
    if (sort) {
      params.set("sortBy", sort.sortBy);
      params.set("sortOrder", sort.sortOrder);
    }

    return params;
  }, [slug, debouncedMinPrice, debouncedMaxPrice, sortOption]);

  const fetchProducts = useCallback(async (page: number, append = false) => {
    // Cancel any in-flight request
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
    }
    fetchAbortController.current = new AbortController();

    setIsLoading(true);
    try {
      const params = buildQueryParams(page);
      const res = await fetch(`${API_BASE_URL}/api/products?${params}`, {
        signal: fetchAbortController.current.signal,
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
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
  }, [buildQueryParams, initialMeta]);

  // Fetch when filters change (sort, price) - but NOT on slug change
  // Slug changes are handled by server navigation, no client fetch needed
  useEffect(() => {
    // Skip initial mount - server already provided correct data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // Check if filters actually changed (not just slug navigation)
    const sortChanged = prevSortRef.current !== sortOption;
    const minPriceChanged = prevMinPriceRef.current !== debouncedMinPrice;
    const maxPriceChanged = prevMaxPriceRef.current !== debouncedMaxPrice;
    
    // Update refs
    prevSortRef.current = sortOption;
    prevMinPriceRef.current = debouncedMinPrice;
    prevMaxPriceRef.current = debouncedMaxPrice;
    
    // Only fetch if filters changed
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

  const gridColsClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const GridIcon = ({ cols }: { cols: number }) => {
    const dots = [];
    const size = cols <= 2 ? 2 : cols <= 4 ? 3 : 4;
    for (let i = 0; i < size * size; i++) {
      dots.push(
        <div
          key={i}
          className={`w-1 h-1 rounded-full ${gridColumns === cols ? "bg-black" : "bg-gray-400"}`}
        />
      );
    }
    return (
      <button
        onClick={() => setGridColumns(cols as GridColumns)}
        className={`p-1.5 grid gap-0.5 hover:opacity-70 transition`}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {dots}
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {isArabic ? "فلتر" : "FILTER"}
        </button>

        {/* Grid View Toggle */}
        <div className="flex items-center gap-1">
          <GridIcon cols={1} />
          <GridIcon cols={2} />
          <GridIcon cols={3} />
          <GridIcon cols={4} />
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition min-w-[140px] justify-between border px-3 py-2 rounded"
          >
            {sortOptions.find((s) => s.value === sortOption)?.label}
            <ChevronDown className={`h-4 w-4 transition ${isSortOpen ? "rotate-180" : ""}`} />
          </button>
          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px]">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                      sortOption === option.value ? "font-semibold text-red-600" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading && products.length === 0 ? (
        // Show skeletons when loading with no products
        gridColumns === 1 ? (
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardHorizontalSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={`grid ${gridColsClass[gridColumns]} gap-4 md:gap-6`}>
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : gridColumns === 1 ? (
        <div className="divide-y">
          {products.map((product) => (
            <ProductCardHorizontal
              key={product.id}
              product={product}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className={`grid ${gridColsClass[gridColumns]} gap-4 md:gap-6`}>
          {products.map((product) => (
            <ProductCardWithVariants
              key={product.id}
              product={product}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Loading / Load More */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isLoading && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        )}
        {!isLoading && meta.page >= meta.totalPages && products.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {isArabic ? "تم عرض جميع المنتجات" : "All products loaded"}
          </p>
        )}
      </div>

      {/* Filter Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFilterOpen(false)}
      />
      <div
        className={`fixed top-0 ${isArabic ? "right-0" : "left-0"} h-full w-80 bg-white z-50 overflow-y-auto transition-transform duration-300 ease-out ${
          isFilterOpen
            ? "translate-x-0"
            : isArabic
            ? "translate-x-full"
            : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-semibold text-sm">
              {isArabic ? "فلتر" : "FILTER"}
            </span>
          </div>
          <button onClick={() => setIsFilterOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collections */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm mb-3">
            {isArabic ? "المجموعات" : "Collections"}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => navigateToCollection(null)}
              className={`block text-sm ${slug === "all-products" ? "text-red-600 font-medium" : "text-gray-600 hover:text-black"}`}
            >
              {isArabic ? "جميع المنتجات" : "All Products"}
            </button>
            {collections.map((collection: any) => (
              <div key={collection.id}>
                <button
                  onClick={() => navigateToCollection(collection.slug)}
                  className={`flex items-center justify-between w-full text-sm ${slug === collection.slug ? "text-red-600 font-medium" : "text-gray-600 hover:text-black"}`}
                >
                  <span>{isArabic ? collection.nameAr : collection.nameEn}</span>
                  {collection._count?.products !== undefined && (
                    <span className="text-xs text-gray-400">({collection._count.products})</span>
                  )}
                </button>
                {/* Nested children */}
                {collection.children && collection.children.length > 0 && (
                  <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                    {collection.children.map((child: any) => (
                      <button
                        key={child.id}
                        onClick={() => navigateToCollection(child.slug)}
                        className={`flex items-center justify-between w-full text-sm ${slug === child.slug ? "text-red-600 font-medium" : "text-gray-500 hover:text-black"}`}
                      >
                        <span>{isArabic ? child.nameAr : child.nameEn}</span>
                        {child._count?.products !== undefined && (
                          <span className="text-xs text-gray-400">({child._count.products})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm mb-3">
            {isArabic ? "التوفر" : "Availability"}
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availability === "inStock"}
                onChange={() => setAvailability(availability === "inStock" ? "all" : "inStock")}
                className="rounded"
              />
              {isArabic ? "متوفر" : "In stock"}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={availability === "outOfStock"}
                onChange={() => setAvailability(availability === "outOfStock" ? "all" : "outOfStock")}
                className="rounded"
              />
              {isArabic ? "غير متوفر" : "Out of stock"}
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="p-4">
          <h3 className="font-semibold text-sm mb-3">
            {isArabic ? "السعر" : "Price"}
          </h3>
          <div className="space-y-4">
            <input
              type="range"
              min={0}
              max={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-red-600"
            />
            <div className="flex items-center gap-2 text-sm">
              <span>{isArabic ? "السعر:" : "Price:"}</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
              <span>-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
