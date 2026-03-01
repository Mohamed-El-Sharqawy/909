"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react";

interface ContactPageClientProps {
  locale: string;
}

export function ContactPageClient({ locale }: ContactPageClientProps) {
  const isArabic = locale === "ar";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: isArabic ? "الهاتف" : "Phone",
      value: "+20 123 456 7890",
      href: "tel:+201234567890",
    },
    {
      icon: Mail,
      title: isArabic ? "البريد الإلكتروني" : "Email",
      value: "support@nznstudio.com",
      href: "mailto:support@nznstudio.com",
    },
    {
      icon: MapPin,
      title: isArabic ? "العنوان" : "Address",
      value: isArabic ? "القاهرة، مصر" : "Cairo, Egypt",
      href: null,
    },
    {
      icon: Clock,
      title: isArabic ? "ساعات العمل" : "Working Hours",
      value: isArabic ? "السبت - الخميس: 10 ص - 10 م" : "Sat - Thu: 10 AM - 10 PM",
      href: null,
    },
  ];

  const subjects = [
    { value: "", label: isArabic ? "اختر الموضوع" : "Select a subject" },
    { value: "order", label: isArabic ? "استفسار عن طلب" : "Order Inquiry" },
    { value: "product", label: isArabic ? "استفسار عن منتج" : "Product Inquiry" },
    { value: "return", label: isArabic ? "إرجاع / استبدال" : "Return / Exchange" },
    { value: "shipping", label: isArabic ? "الشحن والتوصيل" : "Shipping & Delivery" },
    { value: "feedback", label: isArabic ? "ملاحظات واقتراحات" : "Feedback & Suggestions" },
    { value: "other", label: isArabic ? "أخرى" : "Other" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold">
                {isArabic ? "معلومات التواصل" : "Contact Information"}
              </h2>
              
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.title}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="font-medium hover:text-orange-500 transition"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t">
                <p className="text-sm text-gray-500 mb-3">
                  {isArabic ? "تابعنا على" : "Follow us on"}
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">
                {isArabic ? "موقعنا" : "Our Location"}
              </h2>
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.0!2d31.3547!3d30.0283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583e4e7c9a7c7d%3A0x0!2zMzDCsDAxJzQyLjAiTiAzMcKwMjEnMTcuMCJF!5e0!3m2!1sen!2seg!4v1709150000000"
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={isArabic ? "موقعنا على الخريطة" : "Our location on map"}
                />
              </div>
              <a
                href="https://maps.app.goo.gl/ZXrGAiFDy69UebdT8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-orange-500 hover:text-orange-600 transition"
              >
                <MapPin className="h-4 w-4" />
                {isArabic ? "احصل على الاتجاهات" : "Get Directions"}
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">
                {isArabic ? "أرسل لنا رسالة" : "Send us a Message"}
              </h2>

              {submitStatus === "success" ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? "تم إرسال رسالتك!" : "Message Sent!"}
                  </h3>
                  <p className="text-gray-500">
                    {isArabic
                      ? "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن."
                      : "Thank you for reaching out. We'll get back to you as soon as possible."}
                  </p>
                  <button
                    onClick={() => setSubmitStatus("idle")}
                    className="mt-6 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    {isArabic ? "إرسال رسالة أخرى" : "Send Another Message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        {isArabic ? "الاسم" : "Name"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                        placeholder={isArabic ? "أدخل اسمك" : "Enter your name"}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        {isArabic ? "البريد الإلكتروني" : "Email"} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                        placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        {isArabic ? "رقم الهاتف" : "Phone"}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                        placeholder={isArabic ? "أدخل رقم هاتفك" : "Enter your phone number"}
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        {isArabic ? "الموضوع" : "Subject"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white"
                      >
                        {subjects.map((subject) => (
                          <option key={subject.value} value={subject.value}>
                            {subject.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      {isArabic ? "الرسالة" : "Message"} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition resize-none"
                      placeholder={isArabic ? "اكتب رسالتك هنا..." : "Write your message here..."}
                    />
                  </div>

                  {submitStatus === "error" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {isArabic
                        ? "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."
                        : "An error occurred while sending your message. Please try again."}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {isArabic ? "جاري الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {isArabic ? "إرسال الرسالة" : "Send Message"}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-center mb-8">
            {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: isArabic ? "ما هي مدة التوصيل؟" : "What is the delivery time?",
                a: isArabic
                  ? "التوصيل داخل القاهرة والجيزة من 1-3 أيام عمل، والمحافظات الأخرى من 3-5 أيام عمل."
                  : "Delivery within Cairo and Giza takes 1-3 business days, other governorates take 3-5 business days.",
              },
              {
                q: isArabic ? "هل يمكنني إرجاع المنتج؟" : "Can I return a product?",
                a: isArabic
                  ? "نعم، يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الاستلام بشرط أن يكون بحالته الأصلية."
                  : "Yes, you can return the product within 14 days of receipt, provided it's in its original condition.",
              },
              {
                q: isArabic ? "ما هي طرق الدفع المتاحة؟" : "What payment methods are available?",
                a: isArabic
                  ? "نقبل الدفع عند الاستلام، البطاقات الائتمانية، فودافون كاش، وفوري."
                  : "We accept cash on delivery, credit cards, Vodafone Cash, and Fawry.",
              },
              {
                q: isArabic ? "كيف يمكنني تتبع طلبي؟" : "How can I track my order?",
                a: isArabic
                  ? "بعد شحن طلبك، ستتلقى رسالة نصية تحتوي على رابط التتبع."
                  : "After your order is shipped, you'll receive an SMS with a tracking link.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
