"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import type { Order } from "@ecommerce/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface OrdersContextType {
  orders: Order[];
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | null>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data?.data || data.data || []);
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getAccessToken]);

  const getOrder = useCallback(
    async (orderId: string): Promise<Order | null> => {
      if (!isAuthenticated) return null;

      try {
        const token = getAccessToken();
        const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          return data.data;
        }
      } catch {
        console.error("Failed to fetch order");
      }
      return null;
    },
    [isAuthenticated, getAccessToken]
  );

  // Fetch orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [isAuthenticated, fetchOrders]);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        isLoading,
        fetchOrders,
        getOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}
