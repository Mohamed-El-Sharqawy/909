"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Props {
  params: { locale: string };
}

export default function SignUpPage({ params }: Props) {
  const router = useRouter();
  const { signUp, isAuthenticated } = useAuth();
  const isArabic = params.locale === "ar";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({ email, password, firstName, lastName, phone });
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || (isArabic ? "فشل إنشاء الحساب" : "Sign up failed"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {isArabic ? "إنشاء حساب" : "Create Account"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? "أنشئ حسابك للاستمتاع بتجربة تسوق أفضل"
              : "Create your account for a better shopping experience"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                {isArabic ? "الاسم الأول" : "First Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder={isArabic ? "الاسم الأول" : "First name"}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {isArabic ? "الاسم الأخير" : "Last Name"}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder={isArabic ? "الاسم الأخير" : "Last name"}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={isArabic ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? "رقم الهاتف" : "Phone Number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+20 1XX XXX XXXX"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? "كلمة المرور" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={isArabic ? "أدخل كلمة المرور" : "Enter your password"}
                className="w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isArabic ? "6 أحرف على الأقل" : "At least 6 characters"}
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder={isArabic ? "أعد إدخال كلمة المرور" : "Confirm your password"}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isArabic ? "جاري إنشاء الحساب..." : "Creating account..."}
              </>
            ) : (
              isArabic ? "إنشاء حساب" : "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">
            {isArabic ? "أو" : "or"}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Sign In Link */}
        <p className="text-center text-sm">
          {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-black hover:underline"
          >
            {isArabic ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </p>

        {/* Continue as Guest */}
        <div className="mt-4 text-center">
          <Link
            href="/collections"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isArabic ? "متابعة كزائر" : "Continue as guest"}
          </Link>
        </div>
      </div>
    </div>
  );
}
