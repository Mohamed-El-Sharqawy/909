"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api-client";
import type { Review } from "../types";

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet<Review[]>(`/api/reviews/product/${productId}`);
        setReviews(data || []);
      } catch {
        console.error("Failed to fetch reviews");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return {
    reviews,
    isLoading,
    averageRating,
    reviewCount: reviews.length,
  };
}
