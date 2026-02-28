import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Our return policy and guidelines",
};

export default async function ReturnPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isArabic ? "سياسة الإرجاع" : "Return Policy"}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "نظرة عامة" : "Overview"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نريد أن تكون راضيًا تمامًا عن مشترياتك. إذا لم تكن راضيًا عن منتج ما، يمكنك إرجاعه وفقًا للشروط الموضحة أدناه."
              : "We want you to be completely satisfied with your purchase. If you are not satisfied with a product, you may return it according to the terms outlined below."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "فترة الإرجاع" : "Return Period"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "يمكنك إرجاع المنتجات خلال 14 يومًا من تاريخ الاستلام. يجب أن تكون المنتجات في حالتها الأصلية مع جميع العلامات والتغليف."
              : "You may return products within 14 days of receipt. Products must be in their original condition with all tags and packaging intact."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "شروط الإرجاع" : "Return Conditions"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "يجب أن تكون المنتجات غير مستخدمة وفي حالتها الأصلية"
                : "Products must be unused and in original condition"}
            </li>
            <li>
              {isArabic
                ? "يجب أن تكون جميع العلامات والملصقات مرفقة"
                : "All tags and labels must be attached"}
            </li>
            <li>
              {isArabic
                ? "يجب تضمين إيصال الشراء الأصلي"
                : "Original purchase receipt must be included"}
            </li>
            <li>
              {isArabic
                ? "يجب إعادة المنتجات في عبوتها الأصلية"
                : "Products must be returned in original packaging"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "المنتجات غير القابلة للإرجاع" : "Non-Returnable Items"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "الملابس الداخلية وملابس السباحة"
                : "Underwear and swimwear"}
            </li>
            <li>
              {isArabic
                ? "المنتجات المخصصة أو المصنوعة حسب الطلب"
                : "Customized or made-to-order products"}
            </li>
            <li>
              {isArabic
                ? "منتجات التخفيضات النهائية"
                : "Final sale items"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "كيفية الإرجاع" : "How to Return"}
          </h2>
          <ol className="list-decimal list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "تواصل مع خدمة العملاء لطلب الإرجاع"
                : "Contact customer service to request a return"}
            </li>
            <li>
              {isArabic
                ? "احصل على رقم تصريح الإرجاع"
                : "Obtain a return authorization number"}
            </li>
            <li>
              {isArabic
                ? "قم بتغليف المنتج بشكل آمن"
                : "Pack the product securely"}
            </li>
            <li>
              {isArabic
                ? "أرسل المنتج إلى العنوان المحدد"
                : "Ship the product to the designated address"}
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "إذا كان لديك أي أسئلة حول سياسة الإرجاع، يرجى التواصل معنا عبر صفحة اتصل بنا."
              : "If you have any questions about our return policy, please contact us through our contact page."}
          </p>
        </section>
      </div>
    </div>
  );
}
