"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ContactBody, type LeadCreatedResponse } from "@xsf/contracts";
import type { z } from "zod";
import { api } from "@/lib/api/client";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/feedback";

type In = z.input<typeof ContactBody>;
type Body = z.output<typeof ContactBody>;
export function ContactForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<In, unknown, Body>({ resolver: zodResolver(ContactBody) });
  const m = useMutation({ mutationFn: (b: Body) => api.post<LeadCreatedResponse>("/contact", b) });
  if (m.isSuccess) return <Notice tone="success" className="p-6 text-[15px]"><b>Message sent (ref {m.data.reference}).</b> We reply within one business day. <button onClick={() => { m.reset(); reset(); }} className="underline">Send another</button></Notice>;
  return (
    <form onSubmit={handleSubmit((b) => m.mutate(b))} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Label>Name<Input {...register("name")} /><FieldError>{errors.name?.message}</FieldError></Label>
      <Label>Email<Input type="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></Label>
      <Label>Phone (optional)<Input {...register("phone")} /></Label>
      <Label>Subject<Input {...register("subject")} placeholder="Order, product question, partnership…" /></Label>
      <Label className="sm:col-span-2">Message<Textarea rows={5} {...register("message")} /><FieldError>{errors.message?.message}</FieldError></Label>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />
      <div className="sm:col-span-2 flex items-center gap-4"><Button type="submit" variant="dark" size="lg" disabled={m.isPending}>{m.isPending ? "Sending…" : "Send message"}</Button>{m.isError && <span className="text-[13.5px] text-danger">Couldn't send. Please try again.</span>}</div>
    </form>
  );
}
