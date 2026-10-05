"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductCard, Cart, CheckoutCreateResponse, CheckoutStatusResponse, Me, RegionsResponse, SearchSuggestResponse, ShippingRatesResponse, Address } from "@xsf/contracts";
import { api } from "./client";

export const keys = {
  cart: ["cart"] as const,
  regions: ["regions"] as const,
  me: ["me"] as const,
  suggest: (q: string) => ["suggest", q] as const,
  rates: ["cart", "rates"] as const,
  wishlistProducts: ["catalog", "products", "wishlist"] as const,
  status: (id: string) => ["checkout", "status", id] as const,
};

export const useCart = () => useQuery({ queryKey: keys.cart, queryFn: () => api.get<Cart>("/cart"), staleTime: 15_000 });
export const useRegions = () => useQuery({ queryKey: keys.regions, queryFn: () => api.get<RegionsResponse>("/regions"), staleTime: 5 * 60_000 });
export const useMe = () => useQuery({ queryKey: keys.me, queryFn: () => api.get<Me | null>("/me"), staleTime: 60_000, retry: false });
export const useSuggest = (q: string) => useQuery({ queryKey: keys.suggest(q), queryFn: () => api.get<SearchSuggestResponse>(`/search/suggest?q=${encodeURIComponent(q)}`), enabled: q.trim().length >= 2, staleTime: 30_000 });
export const useShippingRates = (enabled: boolean) => useQuery({ queryKey: keys.rates, queryFn: () => api.get<ShippingRatesResponse>("/cart/shipping-rates"), enabled, staleTime: 0 });
export const useCheckoutStatus = (orderId: string, active: boolean) =>
  useQuery({ queryKey: keys.status(orderId), queryFn: () => api.get<CheckoutStatusResponse>(`/checkout/status/${orderId}`), enabled: !!orderId, refetchInterval: active ? 2500 : false });

function useCartMutation<TVars>(fn: (v: TVars) => Promise<Cart>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (cart) => {
      qc.setQueryData(keys.cart, cart);
      void qc.invalidateQueries({ queryKey: keys.rates });
    },
  });
}
export const useAddLine = () => useCartMutation((v: { variantId: string; qty?: number }) => api.post<Cart>("/cart/lines", v));
export const useUpdateLine = () => useCartMutation((v: { id: string; qty: number }) => api.patch<Cart>(`/cart/lines/${v.id}`, { qty: v.qty }));
export const useRemoveLine = () => useCartMutation((id: string) => api.del<Cart>(`/cart/lines/${id}`));
export const useApplyCoupon = () => useCartMutation((code: string) => api.post<Cart>("/cart/coupon", { code }));
export const useRemoveCoupon = () => useCartMutation(() => api.del<Cart>("/cart/coupon"));
export const useSetAddress = () => useCartMutation((v: { email: string; address: Address }) => api.post<Cart>("/cart/address", v));
export const useSetShipping = () => useCartMutation((optionId: string) => api.post<Cart>("/cart/shipping-rate", { optionId }));

export function useSelectRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (region: string) => api.post("/regions/select", { region }),
    onSuccess: () => {
      // Region changes prices, currency and cart — refetch everything and re-render server pages.
      void qc.invalidateQueries();
      window.location.reload();
    },
  });
}

export const useCreateCheckout = () => useMutation({ mutationFn: (v: { notes?: string; marketingOptIn: boolean }) => api.post<CheckoutCreateResponse>("/checkout/create", { ...v, acceptTerms: true }) });
export const useMockPay = () => useMutation({ mutationFn: (v: { orderId: string; outcome: "success" | "failure" }) => api.post<CheckoutStatusResponse>("/checkout/mock/complete", v) });
/** The catalogue is small, so the wishlist page loads it once and keeps the saved slugs. */
export const useWishlistProducts = (enabled: boolean) => useQuery({ queryKey: keys.wishlistProducts, queryFn: () => api.get<{ items: ProductCard[] }>("/catalog/products?perPage=48"), enabled, staleTime: 60_000 });
