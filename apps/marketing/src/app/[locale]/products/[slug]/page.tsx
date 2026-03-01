import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./client";
import { generateProductMetadata } from "@/lib/metadata";
import { API_URL } from "@/lib/api-client";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/api/products/${slug}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

async function getRelatedProducts(product: any) {
  const excludeId = product.id;
  const collectionId = product.collectionId;
  
  // First, try to get products from the same collection
  if (collectionId) {
    const params = new URLSearchParams({ limit: "6", collectionId });
    const res = await fetch(`${API_URL}/api/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      const products = (data.data.data || []).filter((p: any) => p.id !== excludeId);
      
      // If we have enough products from the same collection, return them
      if (products.length >= 3) {
        return products.slice(0, 4);
      }
      
      // If not enough, try to get more from parent collection
      if (product.collection?.parentId) {
        const parentParams = new URLSearchParams({ limit: "6", collectionId: product.collection.parentId });
        const parentRes = await fetch(`${API_URL}/api/products?${parentParams}`, {
          next: { revalidate: 60 },
        });
        if (parentRes.ok) {
          const parentData = await parentRes.json();
          const parentProducts = (parentData.data.data || []).filter(
            (p: any) => p.id !== excludeId && !products.find((existing: any) => existing.id === p.id)
          );
          // Combine: products from same collection first, then parent collection
          return [...products, ...parentProducts].slice(0, 4);
        }
      }
      
      return products.slice(0, 4);
    }
  }
  
  // Fallback: get featured products if no collection
  const fallbackRes = await fetch(`${API_URL}/api/products?limit=4&isFeatured=true`, {
    next: { revalidate: 60 },
  });
  if (!fallbackRes.ok) return [];
  const fallbackData = await fallbackRes.json();
  return (fallbackData.data.data || []).filter((p: any) => p.id !== excludeId).slice(0, 4);
}

// Generate static params for all active products
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=1000&isActive=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data?.data?.data || [];
    
    // Generate params for both locales
    const params: { locale: string; slug: string }[] = [];
    for (const product of products) {
      params.push({ locale: "en", slug: product.slug });
      params.push({ locale: "ar", slug: product.slug });
    }
    return params;
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return { title: "Product Not Found" };
  }

  return generateProductMetadata({ product, locale });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);

  return (
    <ProductPageClient 
      product={product} 
      relatedProducts={relatedProducts}
      locale={locale} 
    />
  );
}
