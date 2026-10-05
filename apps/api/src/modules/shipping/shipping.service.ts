import type { ShippingOption } from "@xsf/contracts";
import { prisma } from "../../shared/prisma.js";
import { money, n, round2 } from "../../shared/money.js";
import type { RegionCtx } from "../regions/regions.service.js";
import { shiprocket } from "../../integrations/shiprocket/shiprocket.adapter.js";

/**
 * Rate rules per region (admin-editable). When Shiprocket credentials exist the adapter can
 * add live courier quotes on top; without them we return the rule-based options only.
 */
export const shippingService = {
  async options(region: RegionCtx, totalWeightGrams: number, merchandiseTotal: number, countryCode: string): Promise<ShippingOption[]> {
    const rules = await prisma.shippingRule.findMany({ where: { regionCode: region.code, active: true }, orderBy: { sortOrder: "asc" } });
    const kg = Math.max(0.5, totalWeightGrams / 1000);
    const opts: ShippingOption[] = rules.map((r) => {
      const free = r.freeAbove != null && merchandiseTotal >= n(r.freeAbove);
      const amount = free ? 0 : round2(n(r.baseAmount) + n(r.perKg) * Math.max(0, kg - 0.5));
      return { id: r.id, name: free && amount === 0 && r.carrier !== "Pickup" ? `${r.name} (free)` : r.name, carrier: r.carrier, amount: money(amount, region.currency), etaDays: [r.etaMinDays, r.etaMaxDays] };
    });
    if (shiprocket.configured && region.code === "IN") {
      const live = await shiprocket.serviceability({ deliveryPostcode: "", weightKg: kg, codAmount: 0 }).catch(() => []);
      for (const l of live) opts.push({ id: `sr:${l.courierId}`, name: l.courierName, carrier: "Shiprocket", amount: money(l.rate, region.currency), etaDays: [l.etdDays, l.etdDays + 2] });
    }
    void countryCode;
    return opts;
  },
  async optionById(region: RegionCtx, id: string, totalWeightGrams: number, merchandiseTotal: number, countryCode: string) {
    return (await this.options(region, totalWeightGrams, merchandiseTotal, countryCode)).find((o) => o.id === id) ?? null;
  },
};
