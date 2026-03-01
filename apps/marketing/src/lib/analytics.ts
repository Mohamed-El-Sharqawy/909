/**
 * Analytics tracking utilities for the marketing app
 * Sends events to the backend for storage and analysis
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Generate or retrieve session ID for anonymous tracking
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Fire and forget - don't block the UI
async function trackEvent(endpoint: string, data: Record<string, unknown>): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await fetch(`${API_URL}/api/analytics/track/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": sessionId,
      },
      body: JSON.stringify(data),
      // Use keepalive to ensure request completes even if page navigates
      keepalive: true,
    });
  } catch {
    // Silently fail - analytics should never break the app
    console.debug("[Analytics] Failed to track event:", endpoint);
  }
}

/**
 * Track product page view
 */
export function trackProductView(productId: string, productSlug?: string): void {
  trackEvent("product-view", { productId, productSlug });
}

/**
 * Track collection page view
 */
export function trackCollectionView(collectionId: string, collectionSlug?: string): void {
  trackEvent("collection-view", { collectionId, collectionSlug });
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultsCount: number): void {
  trackEvent("search", { query, resultsCount });
}

/**
 * Track quick add to cart from product card
 */
export function trackQuickAddToCart(productId: string, variantId: string): void {
  trackEvent("cart-add", { productId, variantId, source: "quick_add" });
}

/**
 * Track remove from cart
 */
export function trackCartRemove(productId: string, variantId: string): void {
  trackEvent("cart-remove", { productId, variantId });
}

/**
 * Track favourite add/remove
 */
export function trackFavouriteToggle(productId: string, action: "add" | "remove"): void {
  trackEvent(`favourite-${action}`, { productId });
}

/**
 * Track wishlist add/remove
 */
export function trackWishlistToggle(productId: string, action: "add" | "remove"): void {
  trackEvent(`wishlist-${action}`, { productId });
}

/**
 * Track checkout page view
 */
export function trackCheckoutView(cartItemCount: number, cartTotal: number): void {
  trackEvent("checkout-view", { cartItemCount, cartTotal });
}

/**
 * Track checkout step progression
 */
export function trackCheckoutStep(step: "shipping" | "payment" | "review", data?: Record<string, unknown>): void {
  trackEvent("checkout-step", { step, ...data });
}

/**
 * Track checkout abandonment (user leaves checkout)
 */
export function trackCheckoutAbandon(step: string, cartItemCount: number, cartTotal: number): void {
  trackEvent("checkout-abandon", { step, cartItemCount, cartTotal });
}

/**
 * Track order completion
 */
export function trackOrderComplete(orderId: string, total: number, itemCount: number): void {
  trackEvent("order-complete", { orderId, total, itemCount });
}
