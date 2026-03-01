"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import type { Product } from "@ecommerce/shared-types";
import { API_URL } from "@/lib/api-client";

interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  note?: string;
  product?: Product;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string, variantId?: string, note?: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string, variantId?: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setWishlistItems(
            (data.data || []).map((item: any) => ({
              id: item.id,
              productId: item.productId,
              variantId: item.variantId,
              note: item.note,
              product: item.product,
            }))
          );
        }
      } catch {
        console.error("Failed to fetch wishlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, getAccessToken]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistItems.some((item) => item.productId === productId),
    [wishlistItems]
  );

  const addToWishlist = useCallback(
    async (productId: string, variantId?: string, note?: string) => {
      if (!isAuthenticated) return;

      // Optimistic update with temp id
      const tempItem: WishlistItem = {
        id: `temp-${productId}`,
        productId,
        variantId,
        note,
      };
      setWishlistItems((prev) => [...prev, tempItem]);

      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, variantId, note }),
        });
        if (res.ok) {
          const data = await res.json();
          // Replace temp item with real data
          setWishlistItems((prev) =>
            prev.map((item) =>
              item.id === `temp-${productId}`
                ? {
                    id: data.data.id,
                    productId: data.data.productId,
                    variantId: data.data.variantId,
                    note: data.data.note,
                    product: data.data.product,
                  }
                : item
            )
          );
        }
      } catch {
        // Revert on error
        setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
      }
    },
    [isAuthenticated, getAccessToken]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      const removedItem = wishlistItems.find((item) => item.productId === productId);

      // Optimistic update
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));

      try {
        const token = getAccessToken();
        await fetch(`${API_URL}/api/wishlist/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Revert on error
        if (removedItem) {
          setWishlistItems((prev) => [...prev, removedItem]);
        }
      }
    },
    [isAuthenticated, getAccessToken, wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (productId: string, variantId?: string) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId, variantId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
