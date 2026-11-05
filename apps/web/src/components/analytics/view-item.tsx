"use client";
import { useEffect } from "react";
import { track } from "@/components/analytics/ga";

/** Fires GA4 `view_item` once per product view. `track` drops it unless the visitor accepted analytics. */
export function ViewItem({ id, name, category, price, currency }: { id: string; name: string; category: string; price: number; currency: string }) {
  useEffect(() => {
    track("view_item", { currency, value: price, items: [{ item_id: id, item_name: name, item_category: category, price, quantity: 1 }] });
  }, [id, name, category, price, currency]);
  return null;
}
