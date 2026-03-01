"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Shield } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { ProductCardWithVariants } from "@/components/ui/product-card-with-variants";
import type { Product } from "@ecommerce/shared-types";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api-client";

interface CartPageClientProps {
  locale: string;
}

export function CartPageClient({ locale }: CartPageClientProps) {
  const t = useTranslations("cart");
  const { items, total, updateQuantity, removeItem } = useCart();
  const isArabic = locale === "ar";
  const [orderNote, setOrderNote] = useState("");
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  // Fetch suggested products based on cart items' collections
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        // Get unique collection IDs from cart items
        const collectionIds = [...new Set(items.map((item) => item.collectionId).filter(Boolean))];
        const productIdsInCart = items.map((item) => item.productId);
        
        let products: Product[] = [];
        
        if (collectionIds.length > 0) {
          // Fetch products from the same collections as cart items
          for (const collectionId of collectionIds.slice(0, 2)) {
            try {
              // First try to get the collection to check if it has a parent
              const collectionData = await apiGet<{ data: { parentId?: string } }>(`/api/collections/${collectionId}`);
              const parentId = collectionData.data?.parentId;
              
              // Fetch products from this collection
              const data = await apiGet<{ data: { data: Product[] } }>(`/api/products?limit=6&collectionId=${collectionId}&isActive=true`);
              const collectionProducts = (data.data?.data || []).filter((p: Product) => !productIdsInCart.includes(p.id));
              
              // If not enough products and has parent, fetch from parent
              if (collectionProducts.length < 4 && parentId) {
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
          // Filter duplicates and limit to 4
          const uniqueProducts = products.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
          products = uniqueProducts.slice(0, 4);
        }
        
        // Fallback to featured products if no collection-based suggestions
        if (products.length < 4) {
          try {
            const data = await apiGet<{ data: { data: Product[] } }>("/api/products?limit=6&isFeatured=true&isActive=true");
            if (data.data?.data) {
              const featured = data.data.data.filter((p: Product) => !productIdsInCart.includes(p.id) && !products.find((x) => x.id === p.id));
              products = [...products, ...featured].slice(0, 4);
            }
          } catch {
            // Ignore error
          }
        }
        
        setSuggestedProducts(products);
      } catch {
        // Fallback to featured on error
        try {
          const data = await apiGet<{ data: { data: Product[] } }>("/api/products?limit=4&isFeatured=true");
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

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-4">
            {t("empty")}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t("emptyDesc")}
          </p>
          <Link
            href="/collections"
            className="inline-block px-8 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition"
          >
            {t("startShopping")}
          </Link>
        </div>

        {/* You may also like */}
        {suggestedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-center mb-8">
              {t("youMayLike")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {suggestedProducts.map((product) => (
                <ProductCardWithVariants
                  key={product.id}
                  product={product}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-8">
        {t("title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b text-sm font-medium text-muted-foreground">
            <div className="col-span-6">
              {t("product")}
            </div>
            <div className="col-span-2 text-center">
              {t("price")}
            </div>
            <div className="col-span-2 text-center">
              {t("quantity")}
            </div>
            <div className="col-span-2 text-right">
              {t("total")}
            </div>
          </div>

          {/* Cart Items */}
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.variantId} className="py-6 grid grid-cols-12 gap-4 items-center">
                {/* Product Info */}
                <div className="col-span-12 md:col-span-6 flex gap-4">
                  <Link href={`/products/${item.productSlug}`} className="shrink-0">
                    <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden relative">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={isArabic ? item.productNameAr : item.productNameEn}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                          {t("noImage")}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="font-medium hover:underline"
                    >
                      {isArabic ? item.productNameAr : item.productNameEn}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.colorNameEn && (isArabic ? item.colorNameAr : item.colorNameEn)}
                      {item.sizeNameEn && ` / ${isArabic ? item.sizeNameAr : item.sizeNameEn}`}
                    </p>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-sm text-red-600 hover:underline mt-2 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t("remove")}
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-4 md:col-span-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        LE {item.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="font-medium text-red-600">
                      LE {item.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-4 md:col-span-2 flex justify-center">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-4 md:col-span-2 text-right font-medium">
                  LE {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Order Note */}
          <div className="mt-8">
            <h3 className="font-medium mb-2">
              {t("orderNote")}
            </h3>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder={t("orderNotePlaceholder")}
              rows={3}
              className="w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">
                {t("subtotal")}
              </span>
              <span className="text-xl font-bold">
                LE {total.toLocaleString()} EGP
              </span>
            </div>

            <Link
              href="/checkout"
              className="w-full py-3 bg-black text-white text-center font-medium rounded flex items-center justify-center gap-2 hover:bg-gray-800 transition"
            >
              <CreditCard className="h-4 w-4" />
              {t("checkout")}
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              {t("safeCheckout")}
            </div>

            {/* Payment Icons */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-xs font-bold text-blue-600">
                VISA
              </div>
              <div className="w-10 h-6 bg-white border rounded flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full -mr-1" />
                <div className="w-4 h-4 bg-yellow-500 rounded-full opacity-80" />
              </div>
              <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-xs font-bold text-orange-500">
                fawry
              </div>
              <div className="w-10 h-6 bg-white border rounded flex items-center justify-center text-xs font-bold">
                valu
              </div>
              <div className="w-10 h-6 bg-black rounded flex items-center justify-center text-xs font-bold text-white">
                Pay
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {suggestedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-center mb-8">
            {isArabic ? "قد يعجبك أيضاً" : "You may also like"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedProducts.map((product) => (
              <ProductCardWithVariants
                key={product.id}
                product={product}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
