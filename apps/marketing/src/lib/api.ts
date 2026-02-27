import type { Product, Collection, ShoppableVideo, InstagramPost, Review, Banner } from "@ecommerce/shared-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    data: T[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

interface FetchOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  products: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params)}` : "";
      return apiFetch<PaginatedResponse<Product>>(`/api/products${query}`);
    },
    featured: () => {
      return apiFetch<PaginatedResponse<Product>>(`/api/products?isFeatured=true`);
    },
    get: (slug: string) =>
      apiFetch<SingleResponse<Product>>(`/api/products/${slug}`),
  },
  collections: {
    list: () => apiFetch<PaginatedResponse<Collection>>("/api/collections"),
    get: (slug: string) =>
      apiFetch<SingleResponse<Collection>>(`/api/collections/${slug}`),
  },
};

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products?isFeatured=true&limit=8`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data?.data ?? [];
  } catch {
    return [];
  }
}

export async function getShoppableVideos(): Promise<ShoppableVideo[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/shoppable-videos`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/instagram-posts`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/reviews/homepage`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/banners?isActive=true`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch {
    return [];
  }
}

export async function getFeaturedHomeCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/collections/featured-home`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch {
    return [];
  }
}
