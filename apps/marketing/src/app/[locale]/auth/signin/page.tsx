"use client";

import { useState, useEffect } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Props {
  params: { locale: string };
}

export default function SignInPage({ params }: Props) {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();
  const isArabic = params.locale === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || (isArabic ? "فشل تسجيل الدخول" : "Sign in failed"));
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
            {isArabic ? "تسجيل الدخول" : "Sign In"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? "أدخل بياناتك للوصول إلى حسابك"
              : "Enter your credentials to access your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                {isArabic ? "جاري تسجيل الدخول..." : "Signing in..."}
              </>
            ) : (
              isArabic ? "تسجيل الدخول" : "Sign In"
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

        {/* Sign Up Link */}
        <p className="text-center text-sm">
          {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-black hover:underline"
          >
            {isArabic ? "إنشاء حساب" : "Sign up"}
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
