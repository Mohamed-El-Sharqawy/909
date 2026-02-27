import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
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
        <section className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 px-4 py-6 md:py-18.5">
          {heroCollections.map((collection, index) => (
            <AnimateOnScroll
              key={collection.id}
              direction="up"
              delay={index * 0.15}
            >
              <CollectionCard
                title={isArabic ? collection.nameAr : collection.nameEn}
                href={`/collections/${collection.slug}`}
                imageUrl={collection.image?.url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=705&h=1010&fit=crop"}
              />
            </AnimateOnScroll>
          ))}
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
