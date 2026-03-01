"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Minus, Plus, Star, Check, Heart, Bookmark } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useFavourites } from "@/contexts/favourites-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { createCartItemFromVariant } from "@/lib/cart";
import { ReviewModal } from "@/components/ui/review-modal";
import { SizeGuideModal } from "@/components/ui/size-guide-modal";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { Link } from "@/i18n/navigation";
import { API_URL } from "@/lib/api-client";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  locale: string;
}

export function ProductPageClient({ product, relatedProducts, locale }: ProductPageClientProps) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const { favouriteIds, addFavourite, removeFavourite } = useFavourites();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";

  // Get initial variant from URL params or default to first
  const getInitialVariant = useCallback(() => {
    const colorParam = searchParams.get("color");
    const sizeParam = searchParams.get("size");
    const variantParam = searchParams.get("variant");

    // Try to find variant by variant slug/id
    if (variantParam) {
      const variant = product.variants?.find((v) => v.slug === variantParam || v.id === variantParam);
      if (variant) return variant;
    }

    // Try to find variant by color and size
    if (colorParam || sizeParam) {
      const variant = product.variants?.find((v) => {
        const colorMatch = !colorParam || v.color?.nameEn?.toLowerCase() === colorParam.toLowerCase();
        const sizeMatch = !sizeParam || v.size?.nameEn?.toLowerCase() === sizeParam.toLowerCase();
        return colorMatch && sizeMatch;
      });
      if (variant) return variant;
    }

    return product.variants?.[0] ?? null;
  }, [product.variants, searchParams]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(getInitialVariant);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFixedBar, setShowFixedBar] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const productInfoRef = useRef<HTMLDivElement>(null);

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const res = await fetch(`${API_URL}/api/reviews/product/${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data || []);
        }
      } catch {
        console.error("Failed to fetch reviews");
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product.id]);

  // Update URL when variant changes
  const updateURL = useCallback((variant: ProductVariant) => {
    const params = new URLSearchParams();
    if (variant.color?.nameEn) {
      params.set("color", variant.color.nameEn.toLowerCase());
    }
    if (variant.size?.nameEn) {
      params.set("size", variant.size.nameEn.toLowerCase());
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [pathname, router]);

  const name = isArabic ? product.nameAr : product.nameEn;
  const description = isArabic ? product.descriptionAr : product.descriptionEn;

  const price = selectedVariant?.price ?? 0;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const images = selectedVariant?.images ?? [];
  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  // Get unique colors and sizes
  const uniqueColors = product.variants
    ?.filter((v) => v.color)
    .reduce((acc, v) => {
      if (v.color && !acc.find((c) => c.id === v.color!.id)) {
        acc.push({ ...v.color, variantId: v.id });
      }
      return acc;
    }, [] as Array<{ id: string; hex: string; nameEn: string; nameAr: string; variantId: string }>);

  const uniqueSizes = product.variants
    ?.filter((v) => v.size)
    .reduce((acc, v) => {
      if (v.size && !acc.find((s) => s.id === v.size!.id)) {
        acc.push({ ...v.size, variantId: v.id });
      }
      return acc;
    }, [] as Array<{ id: string; nameEn: string; nameAr: string; position: number; variantId: string }>)
    .sort((a, b) => a.position - b.position);

  // Get size availability for selected color
  const getSizeAvailability = (sizeId: string) => {
    const variant = product.variants?.find(
      (v) => v.size?.id === sizeId && (!selectedVariant?.color || v.color?.id === selectedVariant.color?.id)
    );
    if (!variant) return { available: false, inStock: false, stock: 0 };
    return { available: true, inStock: variant.stock > 0, stock: variant.stock };
  };

  // Handle scroll for fixed bar
  useEffect(() => {
    const handleScroll = () => {
      if (productInfoRef.current) {
        const rect = productInfoRef.current.getBoundingClientRect();
        setShowFixedBar(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleColorSelect = (colorId: string) => {
    const variant = product.variants?.find(
      (v) => v.color?.id === colorId && (!selectedVariant?.size || v.size?.id === selectedVariant.size?.id)
    );
    if (variant) {
      setSelectedVariant(variant);
      setSelectedImageIndex(0);
      updateURL(variant);
    }
  };

  const handleSizeSelect = (sizeId: string) => {
    const variant = product.variants?.find(
      (v) => v.size?.id === sizeId && (!selectedVariant?.color || v.color?.id === selectedVariant.color?.id)
    );
    if (variant) {
      setSelectedVariant(variant);
      updateURL(variant);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const cartItem = createCartItemFromVariant(selectedVariant, product, quantity);
    addItem(cartItem);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    // Navigate to checkout with buy-now params (variantId, quantity, productSlug)
    const params = new URLSearchParams({
      buyNow: "true",
      variantId: selectedVariant.id,
      quantity: String(quantity),
      productSlug: product.slug,
    });
    router.push(`/${locale}/checkout?${params.toString()}`);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            {t("home")}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{name}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <div ref={productInfoRef} className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-2 w-20">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative aspect-square border-2 rounded overflow-hidden ${
                    selectedImageIndex === idx ? "border-black" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={isArabic ? img.altAr || name : img.altEn || name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative">
              <div className="relative aspect-3/4 bg-neutral-100 rounded-lg overflow-hidden">
                {images[selectedImageIndex] ? (
                  <Image
                    src={images[selectedImageIndex].url}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2">{name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  7 {t("reviews")}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-red-600">
                  LE {price.toLocaleString()}
                </span>
                {compareAtPrice && compareAtPrice > price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      LE {compareAtPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      {discountPercent}% {t("off")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {uniqueColors && uniqueColors.length > 0 && (
              <div>
                <p className="text-sm mb-2">
                  <span className="font-medium">{t("color")}:</span>{" "}
                  <span>{isArabic ? selectedVariant?.color?.nameAr : selectedVariant?.color?.nameEn}</span>
                </p>
                <div className="flex gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color.id)}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        selectedVariant?.color?.id === color.id
                          ? "border-black ring-2 ring-offset-2 ring-black"
                          : "border-gray-300 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={isArabic ? color.nameAr : color.nameEn}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {uniqueSizes && uniqueSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm">
                    <span className="font-medium">{t("size")}:</span>{" "}
                    <span>{isArabic ? selectedVariant?.size?.nameAr : selectedVariant?.size?.nameEn}</span>
                  </p>
                  <button
                    onClick={() => product.sizeGuideUrl && setIsSizeGuideOpen(true)}
                    className={`text-sm underline ${!product.sizeGuideUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!product.sizeGuideUrl}
                  >
                    {t("sizeGuide")}
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const { available, inStock } = getSizeAvailability(size.id);
                    const isSelected = selectedVariant?.size?.id === size.id;
                    const isDisabled = !available;
                    const isOutOfStock = available && !inStock;

                    return (
                      <button
                        key={size.id}
                        onClick={() => !isDisabled && handleSizeSelect(size.id)}
                        disabled={isDisabled}
                        className={`relative min-w-[48px] px-4 py-2 border rounded text-sm font-medium transition ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : isDisabled
                            ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50"
                            : isOutOfStock
                            ? "border-gray-300 text-gray-400 line-through"
                            : "border-gray-300 hover:border-black"
                        }`}
                      >
                        {isArabic ? size.nameAr : size.nameEn}
                        {isOutOfStock && !isSelected && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-medium mb-2">{t("quantity")}</p>
              <div className="flex items-center border rounded w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Favourite & Wishlist */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => favouriteIds.includes(product.id) ? removeFavourite(product.id) : addFavourite(product.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded transition ${
                  favouriteIds.includes(product.id)
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${favouriteIds.includes(product.id) ? "fill-current" : ""}`} />
                {t("favourite")}
              </button>
              <button
                onClick={() => wishlistItems.some(item => item.productId === product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded transition ${
                  wishlistItems.some(item => item.productId === product.id)
                    ? "border-blue-500 text-blue-500 bg-blue-50"
                    : "border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500"
                }`}
              >
                <Bookmark className={`h-5 w-5 ${wishlistItems.some(item => item.productId === product.id) ? "fill-current" : ""}`} />
                {t("wishlist")}
              </button>
            </div>

            {/* Add to Cart & Buy Now */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 border-2 border-black text-black font-semibold rounded hover:bg-gray-100 transition"
              >
                {t("addToCart")} - LE {(price * quantity).toLocaleString()}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition"
              >
                {t("buyNow")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="container mx-auto px-4 py-12 border-t">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {t("customerReviews")}
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                    return (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= avgRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm text-muted-foreground">
                  {reviews.length} {reviews.length !== 1 ? t("reviews") : t("review")}
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
          >
            {t("writeReview")}
          </button>
        </div>

        {/* Reviews List */}
        {isLoadingReviews ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("noReviews")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {review.customerName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                    <span className="font-medium text-sm">{review.customerName || "Anonymous"}</span>
                    {review.userId && (
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {t("verified")}
                      </span>
                    )}
                  </div>
                </div>
                {review.title && (
                  <h4 className="font-semibold text-sm mb-1">{review.title}</h4>
                )}
                <p className="text-sm text-muted-foreground">{review.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(review.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequently Bought Together */}
      {relatedProducts.length >= 2 && (
        <FrequentlyBoughtTogether
          currentProduct={product}
          relatedProducts={relatedProducts.slice(0, 2)}
          locale={locale}
          selectedVariant={selectedVariant}
        />
      )}

      {/* Featured Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-xl font-semibold text-center mb-8">
            {t("featuredProducts")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="group">
                <div className="relative aspect-3/4 bg-neutral-100 rounded overflow-hidden mb-2">
                  {p.variants?.[0]?.images?.[0]?.url && (
                    <Image
                      src={p.variants[0].images[0].url}
                      alt={isArabic ? p.nameAr : p.nameEn}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  {p.variants?.[0]?.compareAtPrice && p.variants[0].compareAtPrice > p.variants[0].price && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      -{Math.round(((p.variants[0].compareAtPrice - p.variants[0].price) / p.variants[0].compareAtPrice) * 100)}%
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium truncate">{isArabic ? p.nameAr : p.nameEn}</h3>
                <div className="flex items-center gap-2">
                  {p.variants?.[0]?.compareAtPrice && p.variants[0].compareAtPrice > p.variants[0].price && (
                    <span className="text-xs text-muted-foreground line-through">
                      LE {p.variants[0].compareAtPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-red-600">
                    LE {p.variants?.[0]?.price?.toLocaleString()}
                  </span>
                </div>
                {/* Color swatches */}
                {p.variants && p.variants.length > 1 && (
                  <div className="flex gap-1 mt-1">
                    {p.variants
                      .filter((v) => v.color)
                      .reduce((acc, v) => {
                        if (v.color && !acc.find((c) => c.id === v.color!.id)) {
                          acc.push(v.color);
                        }
                        return acc;
                      }, [] as Array<{ id: string; hex: string }>)
                      .slice(0, 5)
                      .map((color) => (
                        <span
                          key={color.id}
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 transition-transform duration-300 ${
          showFixedBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Product Image & Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden relative shrink-0">
              {images[0]?.url && (
                <Image
                  src={images[0].url}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium truncate max-w-[200px]">{name}</p>
            </div>
          </div>

          {/* Right: Variant, Quantity, Price, Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-muted-foreground">
              {selectedVariant?.color && (isArabic ? selectedVariant.color.nameAr : selectedVariant.color.nameEn)}
              {selectedVariant?.size && ` / ${isArabic ? selectedVariant.size.nameAr : selectedVariant.size.nameEn}`}
              {" - "}
              <span className="font-semibold text-foreground">LE {price.toLocaleString()}</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center border rounded">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-6 py-2 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition"
            >
              {t("addToCart")}
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        product={product}
        locale={locale}
      />

      {/* Size Guide Modal */}
      {product.sizeGuideUrl && (
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          imageUrl={product.sizeGuideUrl}
          locale={locale}
        />
      )}
    </div>
  );
}

// Frequently Bought Together Component
interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  relatedProducts: Product[];
  locale: string;
  selectedVariant: ProductVariant | null;
}

function FrequentlyBoughtTogether({
  currentProduct,
  relatedProducts,
  locale,
  selectedVariant,
}: FrequentlyBoughtTogetherProps) {
  const t = useTranslations("product");
  const { addItem } = useCart();
  const isArabic = locale === "ar";
  
  // Track which products are selected (current product always selected)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set([currentProduct.id, ...relatedProducts.map((p) => p.id)])
  );

  const toggleProduct = (productId: string) => {
    // Don't allow deselecting the current product
    if (productId === currentProduct.id) return;
    
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // All products in the bundle
  const allProducts = [currentProduct, ...relatedProducts];
  
  // Calculate total price (use actual price, not compareAtPrice)
  const totalPrice = allProducts
    .filter((p) => selectedProducts.has(p.id))
    .reduce((sum, p) => {
      if (p.id === currentProduct.id && selectedVariant) {
        return sum + (selectedVariant.price || 0);
      }
      const variant = p.variants?.[0];
      return sum + (variant?.price || 0);
    }, 0);

  const selectedCount = selectedProducts.size;

  const handleAddAllToCart = () => {
    allProducts.forEach((p) => {
      if (!selectedProducts.has(p.id)) return;
      
      const variant = p.id === currentProduct.id ? selectedVariant : p.variants?.[0];
      if (!variant) return;
      
      const cartItem = createCartItemFromVariant(variant, {
        id: p.id,
        slug: p.slug,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
      }, 1);
      addItem(cartItem);
    });
  };

  const getProductImage = (p: Product) => {
    if (p.id === currentProduct.id && selectedVariant?.images?.[0]?.url) {
      return selectedVariant.images[0].url;
    }
    return p.variants?.[0]?.images?.[0]?.url || "";
  };

  const getProductPrice = (p: Product) => {
    if (p.id === currentProduct.id && selectedVariant) {
      return selectedVariant.price || 0;
    }
    const variant = p.variants?.[0];
    return variant?.price || 0;
  };

  return (
    <div className="container mx-auto px-4 py-12 border-t">
      <h2 className="text-xl font-semibold text-center mb-2">
        {t("frequentlyBought")}
      </h2>
      <p className="text-center text-muted-foreground text-sm mb-6">
        {t("frequentlyBoughtDesc")}
      </p>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-gray-50 rounded-2xl p-4 border">
          {/* Products List - Horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {allProducts.map((p, index) => {
              const isSelected = selectedProducts.has(p.id);
              const isCurrentProduct = p.id === currentProduct.id;
              const productName = isArabic ? p.nameAr : p.nameEn;
              const productPrice = getProductPrice(p);
              const productImage = getProductImage(p);

              return (
                <div key={p.id} className="flex items-center gap-2 shrink-0">
                  {/* Product Card */}
                  <div
                    className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer w-[100px] ${
                      isSelected
                        ? "border-black bg-white shadow-sm"
                        : "border-gray-200 bg-white opacity-50"
                    }`}
                    onClick={() => toggleProduct(p.id)}
                  >
                    {/* Checkbox */}
                    <div
                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                        isSelected
                          ? "bg-black border-black"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Current Product Badge */}
                    {isCurrentProduct && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-1.5 py-0.5 rounded-full whitespace-nowrap z-10">
                        {t("thisItem")}
                      </span>
                    )}

                    {/* Image */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 mb-2">
                      {productImage && (
                        <Image
                          src={productImage}
                          alt={productName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>

                    {/* Name */}
                    <p className="text-[10px] font-medium text-center line-clamp-1 w-full">
                      {productName}
                    </p>

                    {/* Price */}
                    <p className="text-xs font-semibold mt-0.5">
                      LE {productPrice.toLocaleString()}
                    </p>
                  </div>

                  {/* Plus Sign */}
                  {index < allProducts.length - 1 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border text-gray-400 font-bold text-sm shrink-0">
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t my-3" />

          {/* Total & Add to Cart */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {selectedCount} {t("items")}
              </p>
              <p className="text-lg font-bold">
                LE {totalPrice.toLocaleString()}
              </p>
            </div>
            
            <button
              onClick={handleAddAllToCart}
              disabled={selectedCount === 0}
              className="flex-1 max-w-[180px] py-2.5 px-4 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("addAllToCart")}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Products Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {allProducts.map((p, index) => {
            const isSelected = selectedProducts.has(p.id);
            const isCurrentProduct = p.id === currentProduct.id;
            const productName = isArabic ? p.nameAr : p.nameEn;
            const productPrice = getProductPrice(p);
            const productImage = getProductImage(p);

            return (
              <div key={p.id} className="flex items-center gap-4">
                {/* Product Card */}
                <div
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-black bg-white shadow-md"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  } ${isCurrentProduct ? "ring-2 ring-black ring-offset-2" : ""}`}
                  onClick={() => toggleProduct(p.id)}
                >
                  {/* Checkbox */}
                  <div
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                      isSelected
                        ? "bg-black border-black"
                        : "bg-white border-gray-300"
                    } ${isCurrentProduct ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>

                  {/* Current Product Badge */}
                  {isCurrentProduct && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                      {t("thisItem")}
                    </span>
                  )}

                  {/* Image */}
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-neutral-100 mb-3">
                    {productImage && (
                      <Image
                        src={productImage}
                        alt={productName}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    )}
                  </div>

                  {/* Name */}
                  <p className="text-sm font-medium text-center line-clamp-2 max-w-[120px]">
                    {productName}
                  </p>

                  {/* Price */}
                  <p className="text-sm font-semibold mt-1">
                    LE {productPrice.toLocaleString()}
                  </p>
                </div>

                {/* Plus Sign (between products) */}
                {index < allProducts.length - 1 && (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-lg">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total & Add to Cart */}
        <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border min-w-[240px]">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {t("totalForItems", { count: selectedCount })}
            </p>
            <p className="text-2xl font-bold">
              LE {totalPrice.toLocaleString()}
            </p>
          </div>
          
          <button
            onClick={handleAddAllToCart}
            disabled={selectedCount === 0}
            className="w-full py-3 px-6 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("addToCartCount", { count: selectedCount })}
          </button>
          
          <p className="text-xs text-muted-foreground text-center">
            {t("clickToAddRemove")}
          </p>
        </div>
      </div>
    </div>
  );
}
