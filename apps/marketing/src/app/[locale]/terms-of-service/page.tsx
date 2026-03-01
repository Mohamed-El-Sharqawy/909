import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { generatePageMetadata, STATIC_PAGE_METADATA } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";
  const content = isArabic ? STATIC_PAGE_METADATA.termsOfService.ar : STATIC_PAGE_METADATA.termsOfService.en;

  return generatePageMetadata({
    title: content.title,
    description: content.description,
    locale,
    path: "/terms-of-service",
  });
}

export default async function TermsOfServicePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isArabic ? "شروط الخدمة" : "Terms of Service"}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "مقدمة" : "Introduction"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "باستخدام موقعنا وخدماتنا، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام الموقع."
              : "By using our website and services, you agree to be bound by these terms and conditions. Please read them carefully before using the site."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "استخدام الموقع" : "Use of Website"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "يجب أن يكون عمرك 18 عامًا أو أكثر لاستخدام هذا الموقع"
                : "You must be 18 years or older to use this website"}
            </li>
            <li>
              {isArabic
                ? "أنت مسؤول عن الحفاظ على سرية حسابك"
                : "You are responsible for maintaining the confidentiality of your account"}
            </li>
            <li>
              {isArabic
                ? "يجب تقديم معلومات دقيقة وكاملة"
                : "You must provide accurate and complete information"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "الطلبات والمشتريات" : "Orders and Purchases"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "جميع الأسعار بالجنيه المصري وقابلة للتغيير"
                : "All prices are in Egyptian Pounds and subject to change"}
            </li>
            <li>
              {isArabic
                ? "نحتفظ بالحق في رفض أو إلغاء أي طلب"
                : "We reserve the right to refuse or cancel any order"}
            </li>
            <li>
              {isArabic
                ? "توفر المنتجات يخضع للمخزون المتاح"
                : "Product availability is subject to stock"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "الملكية الفكرية" : "Intellectual Property"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات والتصاميم، هي ملك لنا ومحمية بموجب قوانين حقوق النشر."
              : "All content on this website, including text, images, logos, and designs, is our property and protected by copyright laws."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "حدود المسؤولية" : "Limitation of Liability"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام موقعنا أو منتجاتنا، باستثناء ما ينص عليه القانون."
              : "We shall not be liable for any direct or indirect damages arising from the use of our website or products, except as required by law."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "السلوك المحظور" : "Prohibited Conduct"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "استخدام الموقع لأغراض غير قانونية"
                : "Using the website for illegal purposes"}
            </li>
            <li>
              {isArabic
                ? "محاولة الوصول غير المصرح به إلى أنظمتنا"
                : "Attempting unauthorized access to our systems"}
            </li>
            <li>
              {isArabic
                ? "نشر محتوى ضار أو مسيء"
                : "Posting harmful or offensive content"}
            </li>
            <li>
              {isArabic
                ? "انتهاك حقوق الآخرين"
                : "Violating the rights of others"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "التعديلات" : "Modifications"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة ويعتبر استمرارك في استخدام الموقع موافقة على الشروط المعدلة."
              : "We reserve the right to modify these terms at any time. Changes will be posted on this page and your continued use of the website constitutes acceptance of the modified terms."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "القانون الحاكم" : "Governing Law"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "تخضع هذه الشروط وتفسر وفقًا لقوانين جمهورية مصر العربية."
              : "These terms are governed by and construed in accordance with the laws of the Arab Republic of Egypt."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "إذا كان لديك أي أسئلة حول شروط الخدمة، يرجى التواصل معنا عبر صفحة اتصل بنا."
              : "If you have any questions about our terms of service, please contact us through our contact page."}
          </p>
        </section>
      </div>
    </div>
  );
}
