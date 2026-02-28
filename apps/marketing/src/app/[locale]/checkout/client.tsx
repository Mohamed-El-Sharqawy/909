"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  Clock,
  CheckCircle2,
  Loader2,
  Shield,
  User,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString } from "nuqs";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "@/i18n/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface SavedAddress {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface CheckoutPageClientProps {
  locale: string;
}

interface BuyNowItem {
  variantId: string;
  productId: string;
  quantity: number;
  productNameEn: string;
  productNameAr: string;
  variantNameEn: string;
  variantNameAr: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string;
  colorNameEn?: string;
  colorNameAr?: string;
  sizeNameEn?: string;
  sizeNameAr?: string;
}

export function CheckoutPageClient({ locale }: CheckoutPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, total: cartTotal, clearCart, isLoading: cartLoading } = useCart();
  const { user, isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();
  const isArabic = locale === "ar";

  // Check if this is a buy-now checkout
  const isBuyNow = searchParams.get("buyNow") === "true";
  const buyNowVariantId = searchParams.get("variantId");
  const buyNowQuantity = parseInt(searchParams.get("quantity") || "1", 10);
  const buyNowProductSlug = searchParams.get("productSlug");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useQueryState("orderId", parseAsString);
  const orderSuccess = !!orderId;
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [hasAutoSelectedAddress, setHasAutoSelectedAddress] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch buy-now product variant if this is a buy-now checkout
  const { data: buyNowItem, isLoading: isBuyNowLoading } = useQuery({
    queryKey: ["buyNowProduct", buyNowVariantId, buyNowProductSlug],
    queryFn: async (): Promise<BuyNowItem> => {
      if (!buyNowProductSlug) throw new Error("No product slug");
      const res = await fetch(`${API_URL}/api/products/${buyNowProductSlug}`);
      if (!res.ok) throw new Error("Failed to fetch product");
      const data = await res.json();
      const product = data.data;
      const variant = product?.variants?.find((v: any) => v.id === buyNowVariantId);
      if (!variant) throw new Error("Variant not found");
      
      return {
        variantId: variant.id,
        productId: product.id,
        quantity: buyNowQuantity,
        productNameEn: product.nameEn,
        productNameAr: product.nameAr,
        variantNameEn: variant.nameEn,
        variantNameAr: variant.nameAr,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        imageUrl: variant.images?.[0]?.url,
        colorNameEn: variant.color?.nameEn,
        colorNameAr: variant.color?.nameAr,
        sizeNameEn: variant.size?.nameEn,
        sizeNameAr: variant.size?.nameAr,
      };
    },
    enabled: isBuyNow && !!buyNowVariantId && !!buyNowProductSlug,
  });

  // Determine which items to use (buy-now or cart)
  const items = isBuyNow && buyNowItem ? [buyNowItem] : cartItems;
  const total = isBuyNow && buyNowItem 
    ? buyNowItem.price * buyNowItem.quantity 
    : cartTotal;

  const shippingCost = 50; // Fixed shipping cost
  const grandTotal = total + shippingCost;

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone((user as any)?.phone || "");
    }
  }, [user]);

  // Fetch saved addresses for authenticated users using React Query
  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["addresses", isAuthenticated],
    queryFn: async () => {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/users/me/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      const data = await res.json();
      return (data.data || []) as SavedAddress[];
    },
    enabled: isAuthenticated,
  });

  const savedAddresses = addressesData || [];

  // Auto-select first address when addresses are loaded
  useEffect(() => {
    if (savedAddresses.length > 0 && !hasAutoSelectedAddress) {
      const addr = savedAddresses[0];
      setSelectedAddressId(addr.id);
      setFirstName(addr.firstName || user?.firstName || "");
      setLastName(addr.lastName || user?.lastName || "");
      setPhone(addr.phone || "");
      setAddress(addr.street || "");
      setCity(addr.city || "");
      setArea(addr.state || "");
      setHasAutoSelectedAddress(true);
    }
  }, [savedAddresses, hasAutoSelectedAddress, user]);

  // Save address after successful order
  const saveAddressToAccount = async () => {
    if (!isAuthenticated || !saveAddress) return;

    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/api/users/me/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          street: address,
          city,
          state: area || city,
          zipCode: "00000",
          country: "Egypt",
          isDefault: savedAddresses.length === 0,
        }),
      });
    } catch {
      console.error("Failed to save address");
    }
  };

  const shippingCostForOrder = 50; // Fixed shipping cost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        // Flat shipping fields as expected by backend
        shippingFirstName: firstName,
        shippingLastName: lastName,
        shippingStreet: address,
        shippingCity: city,
        shippingState: area || city, // Use area or city as state
        shippingZipCode: "00000", // Default zip code for Egypt
        shippingCountry: "Egypt",
        shippingPhone: phone,
        shippingCost: shippingCostForOrder,
        note: notes,
        // Guest fields (required when not logged in)
        ...(isAuthenticated ? {} : { guestEmail: email, guestFirstName: firstName, guestLastName: lastName, guestPhone: phone }),
      };

      const endpoint = isAuthenticated ? "/api/orders" : "/api/orders/guest";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      
      if (isAuthenticated) {
        const token = getAccessToken();
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Only clear cart when purchasing from cart (not buy-now)
        if (!isBuyNow) {
          clearCart();
        }
        
        // Save address for future use if user is authenticated and checkbox is checked
        if (isAuthenticated && saveAddress && !selectedAddressId) {
          await saveAddressToAccount();
        }
        
        // Set orderId last - this triggers the success state
        setOrderId(data.data?.id || data.data?.orderNumber);
      } else {
        const error = await res.json();
        toast.error(error.error || (isArabic ? "فشل في إتمام الطلب" : "Failed to place order"));
      }
    } catch (err) {
      toast.error(isArabic ? "فشل في إتمام الطلب. حاول مرة أخرى." : "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">
            {isArabic ? "تم تأكيد طلبك!" : "Order Confirmed!"}
          </h1>
          <p className="text-muted-foreground mb-2">
            {isArabic
              ? "شكراً لك على طلبك. سنتواصل معك قريباً لتأكيد التفاصيل."
              : "Thank you for your order. We'll contact you soon to confirm the details."}
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground mb-8">
              {isArabic ? "رقم الطلب:" : "Order ID:"} <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
          <div className="space-y-3">
            <Link
              href="/collections"
              className="block w-full py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition"
            >
              {isArabic ? "متابعة التسوق" : "Continue Shopping"}
            </Link>
            {isAuthenticated && (
              <Link
                href="/account?tab=orders"
                className="block w-full py-3 border border-black font-medium rounded hover:bg-gray-100 transition"
              >
                {isArabic ? "عرض طلباتي" : "View My Orders"}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading state - show spinner while cart/auth/buy-now is loading
  if (cartLoading || authLoading || (isBuyNow && isBuyNowLoading)) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-muted-foreground">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  // Empty cart - only show after loading is complete and not in buy-now mode
  if (!isBuyNow && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">
          {isArabic ? "سلتك فارغة" : "Your cart is empty"}
        </h1>
        <Link
          href="/collections"
          className="inline-block px-8 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition"
        >
          {isArabic ? "تسوق الآن" : "Start Shopping"}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to cart */}
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        {isArabic ? "العودة للسلة" : "Back to cart"}
      </Link>

      <h1 className="text-2xl font-semibold mb-8">
        {isArabic ? "إتمام الطلب" : "Checkout"}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm">1</span>
                {isArabic ? "معلومات الاتصال" : "Contact Information"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isArabic ? "الاسم الأول" : "First Name"} *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isArabic ? "الاسم الأخير" : "Last Name"} *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isArabic ? "البريد الإلكتروني" : "Email"} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isArabic ? "رقم الهاتف" : "Phone"} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+20 1XX XXX XXXX"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm">2</span>
                {isArabic ? "عنوان الشحن" : "Shipping Address"}
              </h2>

              {/* Saved Addresses */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    {isArabic ? "العناوين المحفوظة" : "Saved Addresses"}
                  </label>
                  {isLoadingAddresses ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isArabic ? "جاري التحميل..." : "Loading..."}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setFirstName(addr.firstName || "");
                            setLastName(addr.lastName || "");
                            setPhone(addr.phone || "");
                            setAddress(addr.street || "");
                            setCity(addr.city || "");
                            setArea(addr.state || "");
                          }}
                          className={`w-full text-left p-4 border rounded-lg transition ${
                            selectedAddressId === addr.id
                              ? "border-black bg-gray-50"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium">
                                {addr.firstName} {addr.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {addr.street}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {addr.city}{addr.state ? `, ${addr.state}` : ""}
                              </div>
                              {addr.phone && (
                                <div className="text-sm text-muted-foreground">
                                  {addr.phone}
                                </div>
                              )}
                            </div>
                            {selectedAddressId === addr.id && (
                              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(null);
                          setAddress("");
                          setCity("");
                          setArea("");
                        }}
                        className={`w-full text-left p-4 border rounded-lg transition ${
                          selectedAddressId === null
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">+</span>
                          <span>{isArabic ? "استخدام عنوان جديد" : "Use a new address"}</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isArabic ? "العنوان" : "Address"} *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder={isArabic ? "رقم المبنى، اسم الشارع" : "Building number, Street name"}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isArabic ? "المدينة" : "City"} *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder={isArabic ? "مثال: القاهرة، الجيزة، الإسكندرية" : "e.g. Cairo, Giza, Alexandria"}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {isArabic ? "المنطقة" : "Area"}
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder={isArabic ? "المنطقة / الحي" : "District / Neighborhood"}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {isArabic ? "ملاحظات التوصيل" : "Delivery Notes"}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder={isArabic ? "أي تعليمات خاصة للتوصيل..." : "Any special delivery instructions..."}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                {/* Save address checkbox for authenticated users */}
                {isAuthenticated && !selectedAddressId && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm">
                      {isArabic
                        ? "احفظ هذا العنوان للطلبات القادمة"
                        : "Save this address for future orders"}
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Guest checkout benefits prompt */}
            {!isAuthenticated && (
              <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">
                      {isArabic ? "سجل دخولك للمزيد من المميزات!" : "Sign in for more benefits!"}
                    </p>
                    <ul className="text-sm text-amber-700 mt-1 space-y-1">
                      <li>• {isArabic ? "تتبع طلباتك بسهولة" : "Track your orders easily"}</li>
                      <li>• {isArabic ? "احصل على كوبونات وعروض حصرية" : "Get exclusive coupons & offers"}</li>
                      <li>• {isArabic ? "احفظ عناوينك للطلبات القادمة" : "Save addresses for faster checkout"}</li>
                    </ul>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
                    >
                      <User className="h-4 w-4" />
                      {isArabic ? "تسجيل الدخول" : "Sign in now"}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm">3</span>
                {isArabic ? "طريقة الدفع" : "Payment Method"}
              </h2>

              {/* COD - Active */}
              <div className="border-2 border-black rounded-lg p-4 mb-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full" />
                  </div>
                  <Banknote className="h-5 w-5" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {isArabic ? "الدفع عند الاستلام" : "Cash on Delivery (COD)"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isArabic
                        ? "ادفع نقداً عند استلام طلبك"
                        : "Pay cash when you receive your order"}
                    </p>
                  </div>
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
              </div>

              {/* Coming Soon Payment Methods */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600">
                    {isArabic ? "قريباً" : "Coming Soon"}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Visa */}
                  <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                    <div className="w-12 h-8 bg-linear-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <span className="text-xs text-muted-foreground">Visa</span>
                  </div>
                  
                  {/* Mastercard */}
                  <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                    <div className="w-12 h-8 flex items-center justify-center">
                      <div className="w-5 h-5 bg-red-500 rounded-full -mr-2" />
                      <div className="w-5 h-5 bg-yellow-500 rounded-full opacity-80" />
                    </div>
                    <span className="text-xs text-muted-foreground">Mastercard</span>
                  </div>
                  
                  {/* Apple Pay */}
                  <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                    <div className="w-12 h-8 bg-black rounded flex items-center justify-center text-white text-xs font-medium">
                      Pay
                    </div>
                    <span className="text-xs text-muted-foreground">Apple Pay</span>
                  </div>
                  
                  {/* Vodafone Cash */}
                  <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                    <div className="w-12 h-8 bg-red-600 rounded flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Vodafone Cash</span>
                  </div>
                  
                  {/* Installments */}
                  <div className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                    <div className="w-12 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {isArabic ? "تقسيط" : "Installments"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">
                {isArabic ? "ملخص الطلب" : "Order Summary"}
              </h2>

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
                        {isArabic ? "الكمية:" : "Qty:"} {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      LE {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? "المجموع الفرعي" : "Subtotal"}
                  </span>
                  <span>LE {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {isArabic ? "الشحن" : "Shipping"}
                  </span>
                  <span>LE {shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>{isArabic ? "الإجمالي" : "Total"}</span>
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
                    {isArabic ? "جاري التأكيد..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {isArabic ? "تأكيد الطلب" : "Place Order"}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                {isArabic ? "معلوماتك آمنة ومشفرة" : "Your information is secure"}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
