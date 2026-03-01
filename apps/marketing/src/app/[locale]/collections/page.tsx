import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { CollectionsPageClient } from "./client";
import { generatePageMetadata, STATIC_PAGE_METADATA } from "@/lib/metadata";
import type { Collection } from "@ecommerce/shared-types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const content = isArabic ? STATIC_PAGE_METADATA.collections.ar : STATIC_PAGE_METADATA.collections.en;

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    locale,
    path: "/collections",
  });
}

async function getCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/collections`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const collections = data?.data ?? [];
    // Filter out collections with 0 products
    return collections.filter((c: any) => c._count?.products > 0);
  } catch {
    return [];
  }
}

export default async function CollectionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, collections] = await Promise.all([
    getTranslations("header"),
    getCollections(),
  ]);

  return (
    <CollectionsPageClient
      collections={collections}
      locale={locale}
      translations={{
        shopByCollection: t("shopByCollection"),
      }}
    />
  );
}
