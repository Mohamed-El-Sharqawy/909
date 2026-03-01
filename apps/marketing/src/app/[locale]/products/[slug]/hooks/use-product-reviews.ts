"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type { Review } from "../types";

export function useProductReviews(productId: string) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => apiGet<Review[]>(`/api/reviews/product/${productId}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
