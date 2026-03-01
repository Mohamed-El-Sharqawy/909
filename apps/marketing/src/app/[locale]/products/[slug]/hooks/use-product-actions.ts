"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useFavourites } from "@/contexts/favourites-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { createCartItemFromVariant } from "@/lib/cart";
import type { Product, ProductVariant } from "@ecommerce/shared-types";
import { DEFAULT_QUANTITY, MIN_QUANTITY } from "../constants";

export function useProductActions(product: Product, locale: string) {
  const router = useRouter();
  const { addItem } = useCart();
  const { favouriteIds, addFavourite, removeFavourite } = useFavourites();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);

  const incrementQuantity = useCallback(() => {
    setQuantity((q) => q + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((q) => Math.max(MIN_QUANTITY, q - 1));
  }, []);

  const handleAddToCart = useCallback(
    (selectedVariant: ProductVariant | null) => {
      if (!selectedVariant) return;
      const cartItem = createCartItemFromVariant(selectedVariant, product, quantity);
      addItem(cartItem);
    },
    [addItem, product, quantity]
  );

  const handleBuyNow = useCallback(
    (selectedVariant: ProductVariant | null) => {
      if (!selectedVariant) return;
      const params = new URLSearchParams({
        buyNow: "true",
        variantId: selectedVariant.id,
        quantity: String(quantity),
        productSlug: product.slug,
      });
      router.push(`/${locale}/checkout?${params.toString()}`);
    },
    [locale, product.slug, quantity, router]
  );

  const isFavourite = favouriteIds.includes(product.id);
  const isInWishlist = wishlistItems.some((item) => item.productId === product.id);

  const toggleFavourite = useCallback(() => {
    if (isFavourite) {
      removeFavourite(product.id);
    } else {
      addFavourite(product.id);
    }
  }, [addFavourite, isFavourite, product.id, removeFavourite]);

  const toggleWishlist = useCallback(() => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  }, [addToWishlist, isInWishlist, product.id, removeFromWishlist]);

  return {
    quantity,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    handleAddToCart,
    handleBuyNow,
    isFavourite,
    isInWishlist,
    toggleFavourite,
    toggleWishlist,
  };
}
