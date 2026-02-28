import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  CollectionCard,
  InfiniteMarquee,
  AnimateOnScroll,
} from "@/components/ui";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { PromoBanner } from "@/components/sections/promo-banner";
import { ShoppableVideos } from "@/components/sections/shoppable-videos";
import { InstagramGallery } from "@/components/sections/instagram-gallery";
import { HeroBanner } from "@/components/sections/hero-banner";
import { CustomersFeedback, Features } from "@/components/sections";
import { getFeaturedProducts, getShoppableVideos, getInstagramPosts, getReviews, getBanners, getFeaturedHomeCollections } from "@/lib/api";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";

  const [t, featuredProducts, shoppableVideos, instagramPosts, reviews, banners, heroCollections] = await Promise.all([
    getTranslations("home"),
    getFeaturedProducts(),
    getShoppableVideos(),
    getInstagramPosts(),
    getReviews(),
    getBanners(),
    getFeaturedHomeCollections(),
  ]);

  return (
    <div>
      {/* Hero Banner Carousel */}
      {banners.length > 0 && (
        <HeroBanner banners={banners} locale={locale} />
      )}

      <AnimateOnScroll direction="up">
        <InfiniteMarquee
          text={t("pricesStartingFrom")}
          className="border-y border-border py-3 bg-black"
          textClassName="text-sm font-semibold uppercase tracking-wider text-white"
          separator="—"
          speed="normal"
        />
      </AnimateOnScroll>

      {heroCollections.length > 0 && (
        <section className="py-12 md:py-16">
          {/* Section Title */}
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-medium tracking-wide">
              {isArabic ? "مجموعة جديدة" : "New Collection"}
            </h2>
            <div className="w-12 h-0.5 bg-gray-400 mx-auto mt-3" />
          </div>

          {/* Collections Grid */}
          <div className="max-w-5xl mx-auto px-4">
            {/* Top Row - 2 larger cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {heroCollections.slice(0, 2).map((collection, index) => (
                <AnimateOnScroll
                  key={collection.id}
                  direction="up"
                  delay={index * 0.1}
                >
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="group relative block overflow-hidden aspect-4/3 rounded-lg"
                  >
                    <Image
                      src={collection.image?.url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=450&fit=crop"}
                      alt={isArabic ? collection.nameAr : collection.nameEn}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-white text-xl md:text-2xl font-light italic tracking-wide">
                        {isArabic ? collection.nameAr : collection.nameEn}
                      </h3>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Bottom Row - 3 smaller cards */}
            {heroCollections.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {heroCollections.slice(2, 5).map((collection, index) => (
                  <AnimateOnScroll
                    key={collection.id}
                    direction="up"
                    delay={(index + 2) * 0.1}
                  >
                    <Link
                      href={`/collections/${collection.slug}`}
                      className="group relative block overflow-hidden aspect-4/5 rounded-lg"
                    >
                      <Image
                        src={collection.image?.url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop"}
                        alt={isArabic ? collection.nameAr : collection.nameEn}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white text-lg md:text-xl font-light italic tracking-wide">
                          {isArabic ? collection.nameAr : collection.nameEn}
                        </h3>
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <AnimateOnScroll direction="up">
        <FeaturedProducts locale={locale} products={featuredProducts} />
      </AnimateOnScroll>

      <AnimateOnScroll direction="left">
        <PromoBanner locale={locale} />
      </AnimateOnScroll>

      <AnimateOnScroll direction="up">
        <ShoppableVideos videos={shoppableVideos} locale={locale} />
      </AnimateOnScroll>

      <AnimateOnScroll direction="right">
        <InstagramGallery posts={instagramPosts} locale={locale} />
      </AnimateOnScroll>

      <AnimateOnScroll direction="up">
        <CustomersFeedback reviews={reviews} locale={locale} />
      </AnimateOnScroll>

      <AnimateOnScroll direction="up">
        <Features locale={locale} />
      </AnimateOnScroll>
    </div>
  );
}
