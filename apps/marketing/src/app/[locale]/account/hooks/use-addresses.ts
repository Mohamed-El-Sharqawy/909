"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { apiGet } from "@/lib/api-client";
import type { Address, AddressesState } from "../types";

export function useAddresses(): AddressesState {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAddresses = async () => {
      setIsLoading(true);
      try {
        const token = getAccessToken();
        const response = await apiGet<{ data: Address[] }>("/api/users/me/addresses", { token: token || undefined });
        setAddresses(response.data || []);
      } catch {
        console.error("Failed to fetch addresses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated, getAccessToken]);

  return { addresses, isLoading };
}
