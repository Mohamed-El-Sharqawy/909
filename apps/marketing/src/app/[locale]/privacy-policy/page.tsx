import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our privacy policy and data protection practices",
};

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isArabic = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">
        {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "مقدمة" : "Introduction"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نحن نقدر خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك."
              : "We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "المعلومات التي نجمعها" : "Information We Collect"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "معلومات الاتصال (الاسم، البريد الإلكتروني، رقم الهاتف)"
                : "Contact information (name, email, phone number)"}
            </li>
            <li>
              {isArabic
                ? "عنوان الشحن والفواتير"
                : "Shipping and billing addresses"}
            </li>
            <li>
              {isArabic
                ? "معلومات الدفع"
                : "Payment information"}
            </li>
            <li>
              {isArabic
                ? "سجل الطلبات والمشتريات"
                : "Order history and purchases"}
            </li>
            <li>
              {isArabic
                ? "تفضيلات التصفح والتسوق"
                : "Browsing and shopping preferences"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "كيف نستخدم معلوماتك" : "How We Use Your Information"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "معالجة وتنفيذ طلباتك"
                : "Process and fulfill your orders"}
            </li>
            <li>
              {isArabic
                ? "التواصل معك بشأن طلباتك"
                : "Communicate with you about your orders"}
            </li>
            <li>
              {isArabic
                ? "تحسين خدماتنا ومنتجاتنا"
                : "Improve our services and products"}
            </li>
            <li>
              {isArabic
                ? "إرسال تحديثات تسويقية (بموافقتك)"
                : "Send marketing updates (with your consent)"}
            </li>
            <li>
              {isArabic
                ? "منع الاحتيال وضمان الأمان"
                : "Prevent fraud and ensure security"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "حماية البيانات" : "Data Protection"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نستخدم تدابير أمنية متقدمة لحماية بياناتك الشخصية من الوصول غير المصرح به أو الكشف أو التعديل أو الإتلاف."
              : "We use advanced security measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "ملفات تعريف الارتباط" : "Cookies"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح الخاصة بك. يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح."
              : "We use cookies to enhance your browsing experience. You can manage your cookie preferences through your browser settings."}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "حقوقك" : "Your Rights"}
          </h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>
              {isArabic
                ? "الوصول إلى بياناتك الشخصية"
                : "Access your personal data"}
            </li>
            <li>
              {isArabic
                ? "تصحيح البيانات غير الدقيقة"
                : "Correct inaccurate data"}
            </li>
            <li>
              {isArabic
                ? "طلب حذف بياناتك"
                : "Request deletion of your data"}
            </li>
            <li>
              {isArabic
                ? "إلغاء الاشتراك في الاتصالات التسويقية"
                : "Opt-out of marketing communications"}
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            {isArabic ? "تواصل معنا" : "Contact Us"}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {isArabic
              ? "إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة اتصل بنا."
              : "If you have any questions about our privacy policy, please contact us through our contact page."}
          </p>
        </section>
      </div>
    </div>
  );
}
