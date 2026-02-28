import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Our shipping policy and delivery information",
};

export default async function ShippingPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isArabic ? "سياسة الشحن" : "Shipping Policy"}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "مناطق الشحن" : "Shipping Areas"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نقوم بالشحن إلى جميع أنحاء مصر. للطلبات الدولية، يرجى التواصل مع خدمة العملاء."
              : "We ship to all areas within Egypt. For international orders, please contact customer service."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "مدة التوصيل" : "Delivery Time"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "القاهرة والجيزة: 1-3 أيام عمل"
                : "Cairo & Giza: 1-3 business days"}
            </li>
            <li>
              {isArabic
                ? "الإسكندرية: 2-4 أيام عمل"
                : "Alexandria: 2-4 business days"}
            </li>
            <li>
              {isArabic
                ? "باقي المحافظات: 3-7 أيام عمل"
                : "Other governorates: 3-7 business days"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تكاليف الشحن" : "Shipping Costs"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "القاهرة والجيزة: 50 جنيه"
                : "Cairo & Giza: 50 EGP"}
            </li>
            <li>
              {isArabic
                ? "الإسكندرية: 60 جنيه"
                : "Alexandria: 60 EGP"}
            </li>
            <li>
              {isArabic
                ? "باقي المحافظات: 70-100 جنيه"
                : "Other governorates: 70-100 EGP"}
            </li>
            <li>
              {isArabic
                ? "شحن مجاني للطلبات فوق 1500 جنيه"
                : "Free shipping on orders over 1500 EGP"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تتبع الطلب" : "Order Tracking"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "بمجرد شحن طلبك، ستتلقى رسالة نصية أو بريد إلكتروني يحتوي على رقم التتبع. يمكنك استخدام هذا الرقم لتتبع طلبك."
              : "Once your order is shipped, you will receive an SMS or email with a tracking number. You can use this number to track your order."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "الدفع عند الاستلام" : "Cash on Delivery"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نقبل الدفع عند الاستلام لجميع الطلبات داخل مصر. يرجى تجهيز المبلغ المطلوب عند وصول المندوب."
              : "We accept cash on delivery for all orders within Egypt. Please have the exact amount ready when the courier arrives."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "ملاحظات مهمة" : "Important Notes"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "يرجى التأكد من صحة عنوان الشحن ورقم الهاتف"
                : "Please ensure your shipping address and phone number are correct"}
            </li>
            <li>
              {isArabic
                ? "قد تتأخر الشحنات خلال العطلات والمواسم"
                : "Shipments may be delayed during holidays and peak seasons"}
            </li>
            <li>
              {isArabic
                ? "سيتم التواصل معك قبل التوصيل"
                : "You will be contacted before delivery"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "إذا كان لديك أي أسئلة حول الشحن، يرجى التواصل معنا عبر صفحة اتصل بنا."
              : "If you have any questions about shipping, please contact us through our contact page."}
          </p>
        </section>
      </div>
    </div>
  );
}
