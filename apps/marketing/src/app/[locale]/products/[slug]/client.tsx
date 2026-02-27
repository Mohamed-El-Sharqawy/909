"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Minus, Plus, Star, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { createCartItemFromVariant } from "@/lib/cart";
import { ReviewModal } from "@/components/ui/review-modal";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { Link } from "@/i18n/navigation";

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
  locale: string;
}

export function ProductPageClient({ product, relatedProducts, locale }: ProductPageClientProps) {
  const t = useTranslations("product");
  const { addItem } = useCart();
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
  const productInfoRef = useRef<HTMLDivElement>(null);

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
            {isArabic ? "الرئيسية" : "Home"}
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
                  {isArabic ? "٧ مراجعات" : "7 reviews"}
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
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Color Selection */}
            {uniqueColors && uniqueColors.length > 0 && (
              <div>
                <p className="text-sm mb-2">
                  <span className="font-medium">{isArabic ? "اللون:" : "Color:"}</span>{" "}
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
                    <span className="font-medium">{isArabic ? "المقاس:" : "Size:"}</span>{" "}
                    <span>{isArabic ? selectedVariant?.size?.nameAr : selectedVariant?.size?.nameEn}</span>
                  </p>
                  <button className="text-sm underline">
                    {isArabic ? "دليل المقاسات" : "Size Guide"}
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
              <p className="text-sm font-medium mb-2">{isArabic ? "الكمية" : "Quantity"}</p>
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

            {/* Add to Cart & Buy Now */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full py-3 border-2 border-black text-black font-semibold rounded hover:bg-gray-100 transition"
              >
                {isArabic ? "أضف للسلة" : "Add to cart"} - LE {(price * quantity).toLocaleString()}
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition"
              >
                {isArabic ? "اشتري الآن" : "BUY IT NOW"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-xl font-semibold text-center mb-8">
            {isArabic ? "يُشترى معًا بشكل متكرر" : "Frequently Bought Together"}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {relatedProducts.slice(0, 3).map((p, idx) => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -top-2 -left-2 w-5 h-5 bg-black rounded flex items-center justify-center z-10">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="w-32 h-40 bg-neutral-100 rounded overflow-hidden relative">
                      {p.variants?.[0]?.images?.[0]?.url && (
                        <Image
                          src={p.variants[0].images[0].url}
                          alt={isArabic ? p.nameAr : p.nameEn}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      )}
                    </div>
                    <p className="text-xs mt-2 truncate w-32">{isArabic ? p.nameAr : p.nameEn}</p>
                    <p className="text-xs text-red-600 font-semibold">
                      LE {p.variants?.[0]?.price?.toLocaleString()}
                    </p>
                  </Link>
                </div>
                {idx < 2 && <span className="text-2xl text-gray-400">+</span>}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isArabic ? "السعر الإجمالي:" : "Total price:"}
            </p>
            <p className="text-xl font-bold">
              LE {relatedProducts.slice(0, 3).reduce((sum, p) => sum + (p.variants?.[0]?.price ?? 0), price).toLocaleString()}
            </p>
            <button className="mt-4 px-8 py-2 border border-black rounded hover:bg-gray-100 transition">
              {isArabic ? "أضف للسلة" : "Add to cart"}
            </button>
          </div>
        </div>
      )}

      {/* Customer Reviews */}
      <div className="container mx-auto px-4 py-12 border-t">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {isArabic ? "آراء العملاء" : "Customer Reviews"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">5.0</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {isArabic ? "٢ مراجعات" : "2 reviews"}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
          >
            {isArabic ? "اكتب مراجعة" : "Write a review"}
          </button>
        </div>

        {/* Sample Reviews */}
        <div className="space-y-6">
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                  M
                </span>
                <span className="font-medium text-sm">Marwa Samy</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Verified</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">I loved it!</p>
          </div>

          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                  K
                </span>
                <span className="font-medium text-sm">Kassem</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Verified</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Perfect product with such delicate material that is so soft on the skin.
            </p>
          </div>
        </div>

        {/* Customers Feedback */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-6">
            {isArabic ? "آراء العملاء" : "Customers Feedback"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Omnia", title: "I TRUST YOUU", text: "THANK YOU for this order you delivered it on time and the clothes material are super comfy I'm so grateful for what you do" },
              { name: "Nourhane Amr", title: "Perfect Quality and service", text: "The order was delivered yesterday and am so thankful it came that fast. Thank you for the quality and the rapid response." },
              { name: "Omar Elsayed", title: "BEST LEATHER JACKET EVER", text: "Quality of leather jacket bgdd gamda awy" },
            ].map((feedback, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h4 className="font-semibold">{feedback.title}</h4>
                <p className="text-sm text-muted-foreground">{feedback.text}</p>
                <p className="text-sm font-medium">{feedback.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-12 border-t">
          <h2 className="text-xl font-semibold text-center mb-8">
            {isArabic ? "منتجات مميزة" : "Featured Products"}
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
              {isArabic ? "أضف للسلة" : "Add to cart"}
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
    </div>
  );
}
