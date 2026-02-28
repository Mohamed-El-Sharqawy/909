"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import {
  User,
  Heart,
  Bookmark,
  ShoppingBag,
  Package,
  LogOut,
  Loader2,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Edit,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useFavourites } from "@/contexts/favourites-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { useOrders } from "@/contexts/orders-context";
import { useCart } from "@/contexts/cart-context";
import type { Product } from "@ecommerce/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AccountPageClientProps {
  locale: string;
}

type TabType = "profile" | "orders" | "favourites" | "wishlist" | "cart" | "addresses";

const ORDERS_PER_PAGE = 5;

export function AccountPageClient({ locale }: AccountPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, signOut, getAccessToken } = useAuth();
  const { favouriteIds, favouriteItems, removeFavourite } = useFavourites();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { items: cartItems, total: cartTotal, removeItem, updateQuantity } = useCart();
  const isArabic = locale === "ar";

  // Get initial tab from URL or default to profile
  const getInitialTab = useCallback((): TabType => {
    const tabParam = searchParams.get("tab");
    const validTabs: TabType[] = ["profile", "orders", "favourites", "wishlist", "cart", "addresses"];
    if (tabParam && validTabs.includes(tabParam as TabType)) {
      return tabParam as TabType;
    }
    return "profile";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [ordersPage, setOrdersPage] = useState(1);
  const [favouriteProducts, setFavouriteProducts] = useState<Product[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoadingFavourites, setIsLoadingFavourites] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  // Profile editing state
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setOrdersPage(1); // Reset pagination when switching tabs
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Get favourite products from context (already includes product data)
  useEffect(() => {
    const products = favouriteItems
      .filter((item) => item.product && item.product.id)
      .map((item) => item.product);
    setFavouriteProducts(products);
    setIsLoadingFavourites(false);
  }, [favouriteItems]);

  // Get wishlist products from context (already includes product data)
  useEffect(() => {
    const products = wishlistItems
      .filter((item) => item.product && item.product.id)
      .map((item) => item.product as Product);
    setWishlistProducts(products);
    setIsLoadingWishlist(false);
  }, [wishlistItems]);

  // Fetch addresses
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/api/users/me/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.data || []);
        }
      } catch {
        console.error("Failed to fetch addresses");
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, getAccessToken]);

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleEditPhone = () => {
    setEditPhone((user as any)?.phone || "");
    setPhoneError("");
    setIsEditingPhone(true);
  };

  const handleSavePhone = async () => {
    if (!editPhone.trim()) {
      setPhoneError(isArabic ? "رقم الهاتف مطلوب" : "Phone number is required");
      return;
    }

    setIsSavingPhone(true);
    setPhoneError("");

    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: editPhone }),
      });

      if (res.ok) {
        // Refresh user data by reloading the page
        window.location.reload();
      } else {
        const error = await res.json();
        setPhoneError(error.error || (isArabic ? "فشل تحديث رقم الهاتف" : "Failed to update phone"));
      }
    } catch {
      setPhoneError(isArabic ? "حدث خطأ" : "An error occurred");
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleCancelEditPhone = () => {
    setIsEditingPhone(false);
    setEditPhone("");
    setPhoneError("");
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-muted-foreground">
          {isArabic ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs: { id: TabType; label: string; labelAr: string; icon: React.ReactNode; count?: number }[] = [
    { id: "profile", label: "Profile", labelAr: "الملف الشخصي", icon: <User className="h-4 w-4" /> },
    { id: "orders", label: "Orders", labelAr: "الطلبات", icon: <Package className="h-4 w-4" />, count: orders.length },
    { id: "favourites", label: "Favourites", labelAr: "المفضلة", icon: <Heart className="h-4 w-4" />, count: favouriteIds.length },
    { id: "wishlist", label: "Wishlist", labelAr: "قائمة الرغبات", icon: <Bookmark className="h-4 w-4" />, count: wishlistItems.length },
    { id: "cart", label: "Cart", labelAr: "السلة", icon: <ShoppingBag className="h-4 w-4" />, count: cartItems.length },
    { id: "addresses", label: "Addresses", labelAr: "العناوين", icon: <MapPin className="h-4 w-4" />, count: addresses.length },
  ];

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">
        {isArabic ? `مرحباً، ${user?.firstName}` : `Hello, ${user?.firstName}`}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-20">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === tab.id
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.icon}
                    {isArabic ? tab.labelAr : tab.label}
                  </span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? "bg-white text-black" : "bg-gray-200"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
              <hr className="my-2" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" />
                {isArabic ? "تسجيل الخروج" : "Sign Out"}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-6">
                {isArabic ? "معلومات الحساب" : "Account Information"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      {isArabic ? "الاسم الأول" : "First Name"}
                    </label>
                    <p className="font-medium">{user?.firstName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      {isArabic ? "الاسم الأخير" : "Last Name"}
                    </label>
                    <p className="font-medium">{user?.lastName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {isArabic ? "البريد الإلكتروني" : "Email"}
                    </label>
                    <p className="font-medium">{user?.email || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {isArabic ? "رقم الهاتف" : "Phone"}
                    </label>
                    {isEditingPhone ? (
                      <div className="space-y-2 mt-1">
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+20 1XX XXX XXXX"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                        />
                        {phoneError && (
                          <p className="text-xs text-red-600">{phoneError}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSavePhone}
                            disabled={isSavingPhone}
                            className="px-3 py-1.5 bg-black text-white text-xs rounded hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-1"
                          >
                            {isSavingPhone ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : null}
                            {isArabic ? "حفظ" : "Save"}
                          </button>
                          <button
                            onClick={handleCancelEditPhone}
                            className="px-3 py-1.5 border text-xs rounded hover:bg-gray-100 transition"
                          >
                            {isArabic ? "إلغاء" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{(user as any)?.phone || "-"}</p>
                        <button
                          onClick={handleEditPhone}
                          className="text-muted-foreground hover:text-foreground transition"
                          title={isArabic ? "تعديل" : "Edit"}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      {isArabic ? "الدور" : "Role"}
                    </label>
                    <p className="font-medium capitalize">{user?.role?.toLowerCase() || "customer"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {isArabic ? "تاريخ الانضمام" : "Member Since"}
                    </label>
                    <p className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {isArabic ? "طلباتي" : "My Orders"} ({orders.length})
              </h2>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isArabic ? "لا توجد طلبات بعد" : "No orders yet"}
                  </p>
                  <Link
                    href="/collections"
                    className="inline-block mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    {isArabic ? "تسوق الآن" : "Start Shopping"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders
                    .slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE)
                    .map((order: any) => (
                    <div key={order.id} className="bg-white border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "رقم الطلب" : "Order ID"}
                          </p>
                          <p className="font-mono font-medium">{order.orderNumber || order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "التاريخ" : "Date"}
                          </p>
                          <p className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "الحالة" : "Status"}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "طريقة الدفع" : "Payment"}
                          </p>
                          <p className="font-medium flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {order.paymentMethod || "COD"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? "الإجمالي" : "Total"}
                          </p>
                          <p className="font-bold text-lg">LE {order.total?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium mb-2">
                          {isArabic ? "المنتجات" : "Items"} ({order.items?.length || 0})
                        </p>
                        <div className="space-y-2">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden relative shrink-0">
                                {item.imageUrl && (
                                  <Image
                                    src={item.imageUrl}
                                    alt={isArabic ? item.productNameAr : item.productNameEn}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {isArabic ? item.productNameAr : item.productNameEn}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {isArabic ? item.variantNameAr : item.variantNameEn}
                                  {" × "}{item.quantity}
                                </p>
                              </div>
                              <p className="font-medium">LE {(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm font-medium mb-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {isArabic ? "عنوان الشحن" : "Shipping Address"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.address}, {order.shippingAddress.city}
                            {order.shippingAddress.area && `, ${order.shippingAddress.area}`}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Pagination */}
                  {orders.length > ORDERS_PER_PAGE && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                        disabled={ordersPage === 1}
                        className="p-2 border rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-sm px-4">
                        {isArabic
                          ? `صفحة ${ordersPage} من ${Math.ceil(orders.length / ORDERS_PER_PAGE)}`
                          : `Page ${ordersPage} of ${Math.ceil(orders.length / ORDERS_PER_PAGE)}`}
                      </span>
                      <button
                        onClick={() => setOrdersPage((p) => Math.min(Math.ceil(orders.length / ORDERS_PER_PAGE), p + 1))}
                        disabled={ordersPage >= Math.ceil(orders.length / ORDERS_PER_PAGE)}
                        className="p-2 border rounded hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Favourites Tab */}
          {activeTab === "favourites" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {isArabic ? "المفضلة" : "My Favourites"} ({favouriteIds.length})
              </h2>
              {isLoadingFavourites ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : favouriteProducts.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isArabic ? "لا توجد منتجات مفضلة" : "No favourites yet"}
                  </p>
                  <Link
                    href="/collections"
                    className="inline-block mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    {isArabic ? "استكشف المنتجات" : "Explore Products"}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favouriteProducts.map((product) => {
                    const variant = product.variants?.[0];
                    const imageUrl = (variant?.images?.[0] as any)?.image?.url || variant?.images?.[0]?.url || product.images?.[0]?.url;
                    return (
                      <div key={product.id} className="bg-white border rounded-lg p-4 flex gap-4">
                        <Link href={`/products/${product.slug}`} className="shrink-0">
                          <div className="w-24 h-32 bg-gray-100 rounded overflow-hidden relative">
                            {imageUrl && (
                              <Image
                                src={imageUrl}
                                alt={isArabic ? product.nameAr : product.nameEn}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${product.slug}`} className="font-medium hover:underline line-clamp-2">
                            {isArabic ? product.nameAr : product.nameEn}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isArabic ? product.shortDescriptionAr : product.shortDescriptionEn}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {variant?.compareAtPrice && variant.compareAtPrice > variant.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                LE {variant.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="font-semibold text-red-600">
                              LE {variant?.price?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isArabic ? "المخزون:" : "Stock:"} {variant?.stock || 0}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800 transition"
                            >
                              <Eye className="h-3 w-3" />
                              {isArabic ? "عرض" : "View"}
                            </Link>
                            <button
                              onClick={() => removeFavourite(product.id)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                              {isArabic ? "إزالة" : "Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {isArabic ? "قائمة الرغبات" : "My Wishlist"} ({wishlistItems.length})
              </h2>
              {isLoadingWishlist ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isArabic ? "قائمة الرغبات فارغة" : "Your wishlist is empty"}
                  </p>
                  <Link
                    href="/collections"
                    className="inline-block mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    {isArabic ? "استكشف المنتجات" : "Explore Products"}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistProducts.map((product) => {
                    const wishlistItem = wishlistItems.find((w) => w.productId === product.id);
                    const variant = product.variants?.[0];
                    const imageUrl = (variant?.images?.[0] as any)?.image?.url || variant?.images?.[0]?.url || product.images?.[0]?.url;
                    return (
                      <div key={product.id} className="bg-white border rounded-lg p-4 flex gap-4">
                        <Link href={`/products/${product.slug}`} className="shrink-0">
                          <div className="w-24 h-32 bg-gray-100 rounded overflow-hidden relative">
                            {imageUrl && (
                              <Image
                                src={imageUrl}
                                alt={isArabic ? product.nameAr : product.nameEn}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${product.slug}`} className="font-medium hover:underline line-clamp-2">
                            {isArabic ? product.nameAr : product.nameEn}
                          </Link>
                          {wishlistItem?.note && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{wishlistItem.note}"
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {variant?.compareAtPrice && variant.compareAtPrice > variant.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                LE {variant.compareAtPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="font-semibold text-red-600">
                              LE {variant?.price?.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isArabic ? "المخزون:" : "Stock:"} {variant?.stock || 0}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <Link
                              href={`/products/${product.slug}`}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-black text-white rounded hover:bg-gray-800 transition"
                            >
                              <Eye className="h-3 w-3" />
                              {isArabic ? "عرض" : "View"}
                            </Link>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="flex items-center gap-1 text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                            >
                              <Trash2 className="h-3 w-3" />
                              {isArabic ? "إزالة" : "Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {isArabic ? "سلة التسوق" : "My Cart"} ({cartItems.length})
              </h2>
              {cartItems.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isArabic ? "السلة فارغة" : "Your cart is empty"}
                  </p>
                  <Link
                    href="/collections"
                    className="inline-block mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    {isArabic ? "تسوق الآن" : "Start Shopping"}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-sm">
                        <tr>
                          <th className="text-left px-4 py-3">{isArabic ? "المنتج" : "Product"}</th>
                          <th className="text-center px-4 py-3">{isArabic ? "اللون" : "Color"}</th>
                          <th className="text-center px-4 py-3">{isArabic ? "المقاس" : "Size"}</th>
                          <th className="text-center px-4 py-3">{isArabic ? "السعر" : "Price"}</th>
                          <th className="text-center px-4 py-3">{isArabic ? "الكمية" : "Qty"}</th>
                          <th className="text-right px-4 py-3">{isArabic ? "الإجمالي" : "Total"}</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {cartItems.map((item) => (
                          <tr key={item.variantId}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-14 bg-gray-100 rounded overflow-hidden relative shrink-0">
                                  {item.imageUrl && (
                                    <Image
                                      src={item.imageUrl}
                                      alt={isArabic ? item.productNameAr : item.productNameEn}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  )}
                                </div>
                                <div>
                                  <Link href={`/products/${item.productSlug}`} className="font-medium hover:underline text-sm">
                                    {isArabic ? item.productNameAr : item.productNameEn}
                                  </Link>
                                  <p className="text-xs text-muted-foreground">
                                    {isArabic ? item.variantNameAr : item.variantNameEn}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {item.colorHex ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: item.colorHex }}
                                  />
                                  <span className="text-xs">{isArabic ? item.colorNameAr : item.colorNameEn}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-sm">
                              {isArabic ? item.sizeNameAr : item.sizeNameEn || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                {item.compareAtPrice && item.compareAtPrice > item.price && (
                                  <span className="text-xs text-muted-foreground line-through">
                                    LE {item.compareAtPrice.toLocaleString()}
                                  </span>
                                )}
                                <span className="text-sm font-medium">LE {item.price.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                  className="w-6 h-6 border rounded text-xs hover:bg-gray-100"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                  className="w-6 h-6 border rounded text-xs hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              LE {(item.price * item.quantity).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeItem(item.variantId)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between bg-white border rounded-lg p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{isArabic ? "المجموع الفرعي" : "Subtotal"}</p>
                      <p className="text-xl font-bold">LE {cartTotal.toLocaleString()} EGP</p>
                    </div>
                    <Link
                      href="/checkout"
                      className="px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition"
                    >
                      {isArabic ? "إتمام الشراء" : "Proceed to Checkout"}
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                {isArabic ? "عناويني" : "My Addresses"} ({addresses.length})
              </h2>
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isArabic ? "لا توجد عناوين محفوظة" : "No saved addresses"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isArabic
                      ? "ستُحفظ العناوين تلقائياً عند إتمام طلبك"
                      : "Addresses will be saved automatically when you checkout"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr: any) => (
                    <div key={addr.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {addr.firstName} {addr.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addr.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.city}{addr.area && `, ${addr.area}`}
                          </p>
                          {addr.phone && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                              <Phone className="h-3 w-3" />
                              {addr.phone}
                            </p>
                          )}
                        </div>
                        {addr.isDefault && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {isArabic ? "افتراضي" : "Default"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
