import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { Header, Footer } from "@/components/layout";
import { InfiniteMarquee } from "@/components/ui";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Commerce",
  description: "E-Commerce Platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"}>
      <body className={`${inter.className} overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <InfiniteMarquee
              text={
                locale === "ar"
                  ? "تخفيضات نهاية الموسم"
                  : "END OF SEASON SALE"
              }
              className="bg-red-600 py-2"
              textClassName="text-xs font-semibold text-white uppercase tracking-wider"
              separator="—"
              speed="normal"
            />
            <Header />
            <main>{children}</main>
            <Footer locale={locale} />
            <CartDrawer locale={locale} />
            <Toaster position="top-center" richColors />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
