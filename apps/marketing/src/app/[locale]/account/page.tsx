import { Metadata } from "next";
import { Suspense } from "react";
import { AccountPageClient } from "./client";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your account, orders, favourites, and wishlist",
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  return (
    <Suspense>
      <AccountPageClient locale={locale} />
    </Suspense>
  );
}
