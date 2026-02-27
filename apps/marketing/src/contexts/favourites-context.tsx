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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FavouritesContextType {
  favouriteIds: string[];
  isLoading: boolean;
  isFavourite: (productId: string) => boolean;
  addFavourite: (productId: string) => Promise<void>;
  removeFavourite: (productId: string) => Promise<void>;
  toggleFavourite: (productId: string) => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error("useFavourites must be used within a FavouritesProvider");
  }
  return context;
}

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch favourites when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFavouriteIds([]);
      return;
    }

    const fetchFavourites = async () => {
      setIsLoading(true);
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/api/favourites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const ids = (data.data || []).map((f: any) => f.productId);
          setFavouriteIds(ids);
        }
      } catch {
        console.error("Failed to fetch favourites");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavourites();
  }, [isAuthenticated, getAccessToken]);

  const isFavourite = useCallback(
    (productId: string) => favouriteIds.includes(productId),
    [favouriteIds]
  );

  const addFavourite = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      // Optimistic update
      setFavouriteIds((prev) => [...prev, productId]);

      try {
        const token = getAccessToken();
        await fetch(`${API_URL}/api/favourites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
      } catch {
        // Revert on error
        setFavouriteIds((prev) => prev.filter((id) => id !== productId));
      }
    },
    [isAuthenticated, getAccessToken]
  );

  const removeFavourite = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      // Optimistic update
      setFavouriteIds((prev) => prev.filter((id) => id !== productId));

      try {
        const token = getAccessToken();
        await fetch(`${API_URL}/api/favourites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Revert on error
        setFavouriteIds((prev) => [...prev, productId]);
      }
    },
    [isAuthenticated, getAccessToken]
  );

  const toggleFavourite = useCallback(
    async (productId: string) => {
      if (isFavourite(productId)) {
        await removeFavourite(productId);
      } else {
        await addFavourite(productId);
      }
    },
    [isFavourite, addFavourite, removeFavourite]
  );

  return (
    <FavouritesContext.Provider
      value={{
        favouriteIds,
        isLoading,
        isFavourite,
        addFavourite,
        removeFavourite,
        toggleFavourite,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}
