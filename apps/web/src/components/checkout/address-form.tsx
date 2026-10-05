"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Address, type Cart, type RegionsResponse } from "@xsf/contracts";
import { useSetAddress } from "@/lib/api/queries";
import { Input, Label, Select, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiClientError } from "@/lib/api/client";

const Schema = z.object({ email: z.string().email(), address: Address });
type In = z.input<typeof Schema>;
type Out = z.output<typeof Schema>;
const NAMES: Record<string, string> = { IN: "India", DE: "Germany", FR: "France", NL: "Netherlands", IT: "Italy", ES: "Spain", AT: "Austria", BE: "Belgium", IE: "Ireland", SE: "Sweden", DK: "Denmark", PL: "Poland", PT: "Portugal", CH: "Switzerland", NO: "Norway", FI: "Finland", GB: "United Kingdom", US: "United States", CA: "Canada", AE: "United Arab Emirates", SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait", BH: "Bahrain", OM: "Oman", AU: "Australia", NZ: "New Zealand", SG: "Singapore", JP: "Japan", MY: "Malaysia", HK: "Hong Kong", ZA: "South Africa" };

export function AddressForm({ cart, regions, onDone }: { cart: Cart; regions: RegionsResponse; onDone: () => void }) {
  const region = regions.regions.find((r) => r.code === regions.current)!;
  const { register, handleSubmit, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(Schema),
    defaultValues: { email: cart.email ?? "", address: cart.shippingAddress ?? { firstName: "", lastName: "", line1: "", line2: "", city: "", state: "", postalCode: "", countryCode: region.defaultCountry, phone: "" } },
  });
  const set = useSetAddress();
  const err = set.error as ApiClientError | null;
  return (
    <form onSubmit={handleSubmit((v) => set.mutate(v, { onSuccess: onDone }))} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Label className="sm:col-span-2">Email (for the receipt and tracking)<Input type="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></Label>
      <Label>First name<Input {...register("address.firstName")} /><FieldError>{errors.address?.firstName?.message}</FieldError></Label>
      <Label>Last name<Input {...register("address.lastName")} /><FieldError>{errors.address?.lastName?.message}</FieldError></Label>
      <Label className="sm:col-span-2">Address<Input {...register("address.line1")} placeholder="Street and number" /><FieldError>{errors.address?.line1?.message}</FieldError></Label>
      <Label className="sm:col-span-2">Apartment, floor (optional)<Input {...register("address.line2")} /></Label>
      <Label>City<Input {...register("address.city")} /><FieldError>{errors.address?.city?.message}</FieldError></Label>
      <Label>State / province<Input {...register("address.state")} /></Label>
      <Label>Postal code<Input {...register("address.postalCode")} /><FieldError>{errors.address?.postalCode?.message}</FieldError></Label>
      <Label>Country<Select {...register("address.countryCode")}>{region.countries.map((c) => <option key={c} value={c}>{NAMES[c] ?? c}</option>)}</Select><span className="text-[12px] font-normal text-muted">Shipping somewhere else? Change the region in the header.</span></Label>
      <Label className="sm:col-span-2">Phone (courier contact)<Input {...register("address.phone")} /><FieldError>{errors.address?.phone?.message}</FieldError></Label>
      {err && <p className="sm:col-span-2 text-[13.5px] text-danger">{err.message}</p>}
      <div className="sm:col-span-2"><Button type="submit" variant="dark" size="lg" disabled={set.isPending}>{set.isPending ? "Saving…" : "Continue to shipping"}</Button></div>
    </form>
  );
}
