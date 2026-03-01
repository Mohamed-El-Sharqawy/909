import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { generatePageMetadata, STATIC_PAGE_METADATA } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const content = isArabic ? STATIC_PAGE_METADATA.refundPolicy.ar : STATIC_PAGE_METADATA.refundPolicy.en;

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    locale,
    path: "/refund-policy",
  });
}

export default async function RefundPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isArabic ? "سياسة الاسترداد" : "Refund Policy"}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "نظرة عامة" : "Overview"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نسعى لضمان رضاك التام عن مشترياتك. إذا لم تكن راضيًا، نقدم خيارات استرداد وفقًا للشروط التالية."
              : "We strive to ensure your complete satisfaction with your purchases. If you are not satisfied, we offer refund options according to the following terms."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "أهلية الاسترداد" : "Refund Eligibility"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "يجب طلب الاسترداد خلال 14 يومًا من الاستلام"
                : "Refund must be requested within 14 days of receipt"}
            </li>
            <li>
              {isArabic
                ? "يجب أن تكون المنتجات في حالتها الأصلية"
                : "Products must be in original condition"}
            </li>
            <li>
              {isArabic
                ? "يجب تضمين إثبات الشراء"
                : "Proof of purchase must be included"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "عملية الاسترداد" : "Refund Process"}
          </h2>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "تقديم طلب الاسترداد عبر خدمة العملاء"
                : "Submit refund request through customer service"}
            </li>
            <li>
              {isArabic
                ? "انتظار الموافقة على طلب الاسترداد"
                : "Wait for refund request approval"}
            </li>
            <li>
              {isArabic
                ? "إرجاع المنتج (إذا لزم الأمر)"
                : "Return the product (if required)"}
            </li>
            <li>
              {isArabic
                ? "استلام المبلغ المسترد"
                : "Receive refund amount"}
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "مدة الاسترداد" : "Refund Timeline"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "بمجرد الموافقة على طلب الاسترداد واستلام المنتج المرتجع، سيتم معالجة المبلغ المسترد خلال 5-10 أيام عمل. قد يستغرق ظهور المبلغ في حسابك وقتًا إضافيًا حسب البنك."
              : "Once the refund request is approved and the returned product is received, the refund will be processed within 5-10 business days. It may take additional time for the amount to appear in your account depending on your bank."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "طرق الاسترداد" : "Refund Methods"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "الإرجاع إلى طريقة الدفع الأصلية"
                : "Return to original payment method"}
            </li>
            <li>
              {isArabic
                ? "رصيد المتجر (اختياري)"
                : "Store credit (optional)"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "الاستثناءات" : "Exceptions"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "بعض المنتجات غير قابلة للاسترداد، بما في ذلك منتجات التخفيضات النهائية والمنتجات المخصصة. يرجى مراجعة سياسة الإرجاع للحصول على التفاصيل الكاملة."
              : "Some products are non-refundable, including final sale items and customized products. Please review our return policy for full details."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "إذا كان لديك أي أسئلة حول سياسة الاسترداد، يرجى التواصل معنا عبر صفحة اتصل بنا."
              : "If you have any questions about our refund policy, please contact us through our contact page."}
          </p>
        </section>
      </div>
    </div>
  );
}
