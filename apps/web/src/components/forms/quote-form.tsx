"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { B2BQuoteBody, type B2BQuoteBody as Body, type LeadCreatedResponse } from "@xsf/contracts";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";

const PRODUCTS = ["Organic Black Rice", "Premium Makhana", "Silver Needle White Tea", "Masala Tea", "Green Tea", "Blue Pea Tea", "Joha Rice", "Buckwheat", "Black Pepper", "Ginger / Ginger Powder", "Raw Honey", "Gir Cow Ghee"];
const Form = B2BQuoteBody.extend({ products: z.array(z.string()).min(1, "Pick at least one product") });
type In = z.input<typeof Form>;

export function QuoteForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<In, unknown, Body>({ resolver: zodResolver(Form), defaultValues: { interest: "bulk", country: "IN", products: [], monthlyVolume: "Sample lot", message: "" } });
  const m = useMutation({ mutationFn: (b: Body) => api.post<LeadCreatedResponse>("/b2b/quote", b) });
  if (m.isSuccess) return <Notice tone="success" className="p-6 text-[15px]"><b>Thanks — request {m.data.reference} received.</b><br />A quote lands in your inbox within one working day. <button onClick={() => { m.reset(); reset(); }} className="underline">Send another</button></Notice>;
  return (
    <form onSubmit={handleSubmit((b) => m.mutate(b))} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Label>Company<Input {...register("company")} placeholder="Importer / brand name" /><FieldError>{errors.company?.message}</FieldError></Label>
      <Label>Your name<Input {...register("name")} placeholder="Full name" /><FieldError>{errors.name?.message}</FieldError></Label>
      <Label>Work email<Input type="email" {...register("email")} placeholder="you@company.com" /><FieldError>{errors.email?.message}</FieldError></Label>
      <Label>Phone / WhatsApp<Input {...register("phone")} placeholder="+91" /><FieldError>{errors.phone?.message}</FieldError></Label>
      <Label>Country<Select {...register("country")}>{["IN", "AE", "SA", "US", "CA", "GB", "DE", "FR", "NL", "AU", "SG"].map((c) => <option key={c} value={c}>{c}</option>)}</Select></Label>
      <Label>Need<Select {...register("interest")}><option value="bulk">Bulk supply</option><option value="private_label">Private labelling</option><option value="export">Export</option><option value="other">Other</option></Select></Label>
      <Label>Monthly volume<Select {...register("monthlyVolume")}>{["Sample lot", "25–100 kg", "100–500 kg", "500 kg – 1 t", "Container"].map((v) => <option key={v}>{v}</option>)}</Select></Label>
      <fieldset className="sm:col-span-2"><legend className="mb-2 text-[13.5px] font-semibold">Products of interest</legend>
        <div className="flex flex-wrap gap-2">{PRODUCTS.map((p) => <label key={p} className="cursor-pointer rounded-full border-[1.5px] border-line px-3.5 py-1.5 text-[13.5px] has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white"><input type="checkbox" value={p} {...register("products")} className="sr-only" />{p}</label>)}</div>
        <FieldError>{errors.products?.message as string}</FieldError>
      </fieldset>
      <Label className="sm:col-span-2">Message<Textarea rows={3} {...register("message")} placeholder="Target market, packaging, timelines…" /></Label>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />
      <div className="sm:col-span-2 flex items-center gap-4">
        <Button type="submit" variant="leaf" size="lg" disabled={m.isPending}>{m.isPending ? "Sending…" : "Send request"}</Button>
        {m.isError && <span className="text-[13.5px] text-danger">Couldn't send — please check the fields or email {`info@xiphias.in`}.</span>}
      </div>
    </form>
  );
}
