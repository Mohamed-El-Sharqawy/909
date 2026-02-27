import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { CollectionPageClient } from "./client";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getCollections() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/collections`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data ?? [];
  } catch {
    return [];
  }
}

async function getInitialProducts(slug: string) {
  try {
    const params = new URLSearchParams({
      limit: "32",
      page: "1",
      isActive: "true",
    });

    // Handle special slugs
    if (slug !== "all-products") {
      // Use collectionSlug - backend will include children's products
      params.set("collectionSlug", slug);
    }

    const res = await fetch(`${API_BASE_URL}/api/products?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 32, totalPages: 0 } };
    const data = await res.json();
    return data?.data ?? { data: [], meta: { total: 0, page: 1, limit: 32, totalPages: 0 } };
  } catch {
    return { data: [], meta: { total: 0, page: 1, limit: 32, totalPages: 0 } };
  }
}

export default async function CollectionPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [t, collections, initialData] = await Promise.all([
    getTranslations("collection"),
    getCollections(),
    getInitialProducts(slug),
  ]);

  // Get page title based on slug
  const getTitle = () => {
    if (slug === "all-products") return t("allProducts");
    if (slug === "men") return t("men");
    if (slug === "women") return t("women");
    const collection = collections.find((c: any) => c.slug === slug);
    return locale === "ar" ? collection?.nameAr : collection?.nameEn;
  };

  console.log(initialData.data.length)

  return (
    <CollectionPageClient
      locale={locale}
      slug={slug}
      title={getTitle() || slug}
      collections={collections}
      initialProducts={initialData.data}
      initialMeta={initialData.meta}
    />
  );
}
