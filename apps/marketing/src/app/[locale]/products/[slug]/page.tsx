import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "./client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

async function getProduct(slug: string) {
  const res = await fetch(`${API_URL}/api/products/${slug}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

async function getRelatedProducts(collectionId?: string, excludeId?: string) {
  const params = new URLSearchParams({ limit: "4" });
  if (collectionId) params.set("collectionId", collectionId);
  
  const res = await fetch(`${API_URL}/api/products?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data.data || []).filter((p: any) => p.id !== excludeId).slice(0, 4);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return { title: "Product Not Found" };
  }

  const isArabic = locale === "ar";
  const title = isArabic ? product.nameAr : product.nameEn;
  const description = isArabic 
    ? product.metaDescriptionAr || product.shortDescriptionAr 
    : product.metaDescriptionEn || product.shortDescriptionEn;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.variants?.[0]?.images?.[0]?.url ? [product.variants[0].images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.collectionId, product.id);

  return (
    <ProductPageClient 
      product={product} 
      relatedProducts={relatedProducts}
      locale={locale} 
    />
  );
}
