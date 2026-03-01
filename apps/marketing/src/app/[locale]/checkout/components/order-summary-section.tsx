"use client";

import Image from "next/image";
import { Loader2, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CheckoutItem } from "../types";
import { SHIPPING_COST } from "../constants";

interface OrderSummarySectionProps {
  items: CheckoutItem[];
  total: number;
  locale: string;
  isSubmitting: boolean;
}

export function OrderSummarySection({
  items,
  total,
  locale,
  isSubmitting,
}: OrderSummarySectionProps) {
  const t = useTranslations("checkout");
  const isArabic = locale === "ar";
  const grandTotal = total + SHIPPING_COST;

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
      <h2 className="text-lg font-semibold mb-4">{t("orderSummary")}</h2>

      {/* Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <div className="w-14 h-18 bg-white rounded overflow-hidden relative shrink-0">
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={isArabic ? item.productNameAr : item.productNameEn}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">
                {isArabic ? item.productNameAr : item.productNameEn}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.colorNameEn && (isArabic ? item.colorNameAr : item.colorNameEn)}
                {item.sizeNameEn && ` / ${isArabic ? item.sizeNameAr : item.sizeNameEn}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("qty")} {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium">LE {(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span>LE {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("shipping")}</span>
          <span>LE {SHIPPING_COST.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>{t("total")}</span>
          <span>LE {grandTotal.toLocaleString()} EGP</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("processing")}
          </>
        ) : (
          <>{t("placeOrder")}</>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-4 w-4" />
        {t("infoSecure")}
      </div>
    </div>
  );
}
