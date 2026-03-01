"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Collection } from "@ecommerce/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SearchProduct {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  price: number | null;
  imageUrl: string | null;
}

interface CollectionsPageClientProps {
  collections: Collection[];
  locale: string;
  translations: {
    shopByCollection: string;
  };
}

export function CollectionsPageClient({
  collections,
  locale,
  translations,
}: CollectionsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";

  const initialSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL when search changes
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedQuery === currentSearch) return;
    
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("search", debouncedQuery);
    } else {
      params.delete("search");
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch {
        console.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // Filter collections based on search
  const filteredCollections = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return collections;
    }

    const query = debouncedQuery.toLowerCase();
    return collections.filter((c: any) => {
      const matchesName =
        c.nameEn?.toLowerCase().includes(query) ||
        c.nameAr?.toLowerCase().includes(query);
      const matchesDesc =
        c.descriptionEn?.toLowerCase().includes(query) ||
        c.descriptionAr?.toLowerCase().includes(query);
      return matchesName || matchesDesc;
    });
  }, [collections, debouncedQuery]);

  // Static collections
  const staticCollections = [
    {
      slug: "all-products",
      nameEn: "All Products",
      nameAr: "جميع المنتجات",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop",
    },
  ];

  // Filter static collections too
  const filteredStaticCollections = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return staticCollections;
    }

    const query = debouncedQuery.toLowerCase();
    return staticCollections.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(query) ||
        c.nameAr.toLowerCase().includes(query)
    );
  }, [debouncedQuery]);

  const isSearchActive = debouncedQuery.length >= 2;
  const hasResults = filteredStaticCollections.length > 0 || filteredCollections.length > 0 || searchResults.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {translations.shopByCollection}
      </h1>

      {/* Search Input */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "ابحث عن مجموعات أو منتجات..." : "Search collections or products..."}
            className="w-full pl-12 pr-12 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-black text-sm"
            dir={isArabic ? "rtl" : "ltr"}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        {isSearching && (
          <div className="flex items-center justify-center mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">
              {isArabic ? "جاري البحث..." : "Searching..."}
            </span>
          </div>
        )}
      </div>

      {/* No Results */}
      {isSearchActive && !isSearching && !hasResults && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isArabic
              ? `لا توجد نتائج لـ "${debouncedQuery}"`
              : `No results found for "${debouncedQuery}"`}
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-sm text-black underline hover:no-underline"
          >
            {isArabic ? "مسح البحث" : "Clear search"}
          </button>
        </div>
      )}

      {/* Product Results (when searching) */}
      {isSearchActive && searchResults.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isArabic ? "المنتجات" : "Products"}
            <span className="text-sm font-normal text-gray-500">
              ({searchResults.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="aspect-3/4 bg-gray-100 rounded-lg overflow-hidden relative mb-2">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={isArabic ? product.nameAr : product.nameEn}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  )}
                </div>
                <h3 className="text-sm font-medium truncate">
                  {isArabic ? product.nameAr : product.nameEn}
                </h3>
                {product.price && (
                  <p className="text-sm text-gray-600">
                    LE {product.price.toLocaleString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {(filteredStaticCollections.length > 0 || filteredCollections.length > 0) && (
        <>
          {isSearchActive && (
            <h2 className="text-xl font-semibold mb-4">
              {isArabic ? "المجموعات" : "Collections"}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Static Collections */}
            {filteredStaticCollections.map((collection) => (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
              >
                <Image
                  src={collection.imageUrl}
                  alt={isArabic ? collection.nameAr : collection.nameEn}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-white text-2xl font-bold tracking-wide">
                    {isArabic ? collection.nameAr : collection.nameEn}
                  </h2>
                </div>
              </Link>
            ))}

            {/* Dynamic Collections */}
            {filteredCollections.flatMap((collection: any) => {
              const items = [];
              items.push(
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
                >
                  {collection.image?.url ? (
                    <Image
                      src={collection.image.url}
                      alt={isArabic ? collection.nameAr : collection.nameEn}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h2 className="text-white text-2xl font-bold tracking-wide text-center px-4">
                      {isArabic ? collection.nameAr : collection.nameEn}
                    </h2>
                  </div>
                </Link>
              );

              if (collection.children && collection.children.length > 0) {
                const query = debouncedQuery?.toLowerCase() || "";
                collection.children
                  .filter((child: any) => {
                    if (!isSearchActive) return child._count?.products > 0;
                    const matchesName =
                      child.nameEn?.toLowerCase().includes(query) ||
                      child.nameAr?.toLowerCase().includes(query);
                    return child._count?.products > 0 && matchesName;
                  })
                  .forEach((child: any) => {
                    items.push(
                      <Link
                        key={child.id}
                        href={`/collections/${child.slug}`}
                        className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
                      >
                        {child.image?.url ? (
                          <Image
                            src={child.image.url}
                            alt={isArabic ? child.nameAr : child.nameEn}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
                        )}
                        <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <h2 className="text-white text-2xl font-bold tracking-wide text-center px-4">
                            {isArabic ? child.nameAr : child.nameEn}
                          </h2>
                        </div>
                      </Link>
                    );
                  });
              }
              return items;
            })}
          </div>
        </>
      )}
    </div>
  );
}
