import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Collection } from "@ecommerce/shared-types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getCollections(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/collections`, {
      next: { revalidate: 60 },
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

  const isArabic = locale === "ar";

  // Static collections for Men/Women
  const staticCollections = [
    {
      slug: "all-products",
      nameEn: "All Products",
      nameAr: "جميع المنتجات",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=800&fit=crop",
    },
    {
      slug: "women",
      nameEn: "Women",
      nameAr: "نساء",
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop",
    },
    {
      slug: "men",
      nameEn: "Men",
      nameAr: "رجال",
      imageUrl: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&h=800&fit=crop",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {t("shopByCollection")}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Static Collections */}
        {staticCollections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
          >
            <Image
              src={collection.imageUrl}
              alt={isArabic ? collection.nameAr : collection.nameEn}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-white text-2xl font-bold tracking-wide">
                {isArabic ? collection.nameAr : collection.nameEn}
              </h2>
            </div>
          </Link>
        ))}

        {/* Dynamic Collections from API - flatten parent and children */}
        {collections.flatMap((collection: any) => {
          const items = [];
          // Add parent collection
          items.push(
            <Link
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
            >
              {collection.image?.url ? (
                <Image
                  src={collection.image.url}
                  alt={isArabic ? collection.nameAr : collection.nameEn}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
              )}
              <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-white text-2xl font-bold tracking-wide text-center px-4">
                  {isArabic ? collection.nameAr : collection.nameEn}
                </h2>
              </div>
            </Link>
          );
          // Add child collections
          if (collection.children && collection.children.length > 0) {
            collection.children
              .filter((child: any) => child._count?.products > 0)
              .forEach((child: any) => {
                items.push(
                  <Link
                    key={child.id}
                    href={`/collections/${child.slug}`}
                    className="group relative aspect-3/4 overflow-hidden bg-neutral-100"
                  >
                    {child.image?.url ? (
                      <Image
                        src={child.image.url}
                        alt={isArabic ? child.nameAr : child.nameEn}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-gray-200 to-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h2 className="text-white text-2xl font-bold tracking-wide text-center px-4">
                        {isArabic ? child.nameAr : child.nameEn}
                      </h2>
                    </div>
                  </Link>
                );
              });
          }
          return items;
        })}
      </div>
    </div>
  );
}
