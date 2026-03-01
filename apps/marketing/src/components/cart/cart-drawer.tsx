"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, Eye, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Link } from "@/i18n/navigation";
import { API_URL } from "@/lib/api-client";

interface SuggestedProduct {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  variants: Array<{
    price: number;
    compareAtPrice?: number | null;
    images?: Array<{ url: string }>;
  }>;
}

export function CartDrawer({ locale }: { locale: string }) {
  const { items, total, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const isArabic = locale === "ar";
  const [suggestedProducts, setSuggestedProducts] = useState<SuggestedProduct[]>([]);

  // Fetch suggested products based on cart items' collections
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchSuggested = async () => {
      try {
        // Get unique collection IDs from cart items
        const collectionIds = [...new Set(items.map((item) => item.collectionId).filter(Boolean))];
        const productIdsInCart = items.map((item) => item.productId);
        
        let products: SuggestedProduct[] = [];
        
        if (collectionIds.length > 0) {
          // Fetch products from the same collections as cart items
          for (const collectionId of collectionIds.slice(0, 2)) {
            // First try to get the collection to check if it has a parent
            const collectionRes = await fetch(`${API_URL}/api/collections/${collectionId}`);
            let targetCollectionId = collectionId;
            
            if (collectionRes.ok) {
              const collectionData = await collectionRes.json();
              // If this collection has a parent, we might need to fall back to it
              const parentId = collectionData.data?.parentId;
              
              // Fetch products from this collection
              const res = await fetch(`${API_URL}/api/products?limit=4&collectionId=${collectionId}&isActive=true`);
              if (res.ok) {
                const data = await res.json();
                const collectionProducts = (data.data?.data || []).filter((p: SuggestedProduct) => !productIdsInCart.includes(p.id));
                
                // If not enough products and has parent, fetch from parent
                if (collectionProducts.length < 2 && parentId) {
                  const parentRes = await fetch(`${API_URL}/api/products?limit=6&collectionId=${parentId}&isActive=true`);
                  if (parentRes.ok) {
                    const parentData = await parentRes.json();
                    const parentProducts = (parentData.data?.data || []).filter((p: SuggestedProduct) => !productIdsInCart.includes(p.id));
                    products.push(...collectionProducts, ...parentProducts);
                  } else {
                    products.push(...collectionProducts);
                  }
                } else {
                  products.push(...collectionProducts);
                }
              }
            }
          }
          // Filter duplicates and limit to 2
          const uniqueProducts = products.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
          products = uniqueProducts.slice(0, 2);
        }
        
        // Fallback to featured products if no collection-based suggestions
        if (products.length < 2) {
          const res = await fetch(`${API_URL}/api/products?limit=4&isFeatured=true&isActive=true`);
          if (res.ok) {
            const data = await res.json();
            if (data.data?.data) {
              const featured = data.data.data.filter((p: SuggestedProduct) => !productIdsInCart.includes(p.id) && !products.find((x) => x.id === p.id));
              products = [...products, ...featured].slice(0, 2);
            }
          }
        }
        
        setSuggestedProducts(products);
      } catch {
        // Fallback to featured on error
        fetch(`${API_URL}/api/products?limit=2&isFeatured=true`)
          .then((res) => res.json())
          .then((data) => {
            if (data.data?.data) {
              setSuggestedProducts(data.data.data.slice(0, 2));
            }
          })
          .catch(() => {});
      }
    };
    
    fetchSuggested();
  }, [isOpen, items]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isArabic ? "سلة التسوق" : "Shopping cart"}
          </h2>
          <button
            onClick={closeCart}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">
                {isArabic ? "سلتك فارغة" : "Your cart is empty"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {isArabic
                  ? "أضف بعض المنتجات للبدء"
                  : "Add some products to get started"}
              </p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
              >
                {isArabic ? "تسوق الآن" : "Shop Now"}
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
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
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={closeCart}
                      className="font-medium text-sm hover:underline line-clamp-2"
                    >
                      {isArabic ? item.productNameAr : item.productNameEn}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.colorNameEn && (isArabic ? item.colorNameAr : item.colorNameEn)}
                      {item.sizeNameEn && ` / ${isArabic ? item.sizeNameAr : item.sizeNameEn}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.compareAtPrice && item.compareAtPrice > (item.price || 0) && (
                        <span className="text-xs text-muted-foreground line-through">
                          LE {item.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-red-600">
                        LE {(item.price || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border rounded">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-xs text-muted-foreground hover:text-red-600 transition"
                      >
                        {isArabic ? "إزالة" : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* You May Also Like */}
              {suggestedProducts.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-sm mb-3">
                    {isArabic ? "قد يعجبك أيضاً" : "You may also like"}
                  </h3>
                  <div className="space-y-3">
                    {suggestedProducts.map((product) => {
                      const variant = product.variants?.[0];
                      const hasDiscount = variant?.compareAtPrice && variant.compareAtPrice > variant.price;
                      
                      return (
                        <div key={product.id} className="flex items-center gap-3">
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeCart}
                            className="shrink-0"
                          >
                            <div className="w-14 h-18 bg-white rounded overflow-hidden relative">
                              {variant?.images?.[0]?.url && (
                                <Image
                                  src={variant.images[0].url}
                                  alt={isArabic ? product.nameAr : product.nameEn}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${product.slug}`}
                              onClick={closeCart}
                              className="text-sm font-medium hover:underline line-clamp-1"
                            >
                              {isArabic ? product.nameAr : product.nameEn}
                            </Link>
                            <div className="flex items-center gap-2">
                              {hasDiscount && (
                                <span className="text-xs text-muted-foreground line-through">
                                  LE {variant.compareAtPrice?.toLocaleString()}
                                </span>
                              )}
                              <span className="text-sm font-semibold text-red-600">
                                LE {variant?.price?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeCart}
                            className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                          >
                            <Eye className="h-4 w-4 text-white" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {isArabic ? "المجموع الفرعي" : "Subtotal"}
              </span>
              <span className="text-lg font-bold">
                LE {total.toLocaleString()} EGP
              </span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="py-3 border border-black text-center font-medium rounded hover:bg-gray-100 transition"
              >
                {isArabic ? "عرض السلة" : "View cart"}
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="py-3 bg-black text-white text-center font-medium rounded hover:bg-gray-800 transition"
              >
                {isArabic ? "الدفع" : "Check out"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
