"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoginBody, RegisterBody, type Me } from "@xsf/contracts";
import type { z } from "zod";
import { api, ApiClientError } from "@/lib/api/client";
import { keys } from "@/lib/api/queries";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type L = z.infer<typeof LoginBody>;
type RIn = z.input<typeof RegisterBody>;
type R = z.output<typeof RegisterBody>;

export function LoginForm() {
  const qc = useQueryClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<L>({ resolver: zodResolver(LoginBody) });
  const m = useMutation({ mutationFn: (b: L) => api.post<Me>("/auth/login", b), onSuccess: (me) => { qc.setQueryData(keys.me, me); router.push("/account"); } });
  return (
    <form onSubmit={handleSubmit((b) => m.mutate(b))} className="grid gap-4" noValidate>
      <Label>Email<Input type="email" autoComplete="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></Label>
      <Label>Password<Input type="password" autoComplete="current-password" {...register("password")} /><FieldError>{errors.password?.message}</FieldError></Label>
      {m.isError && <p className="text-[13.5px] text-danger">{(m.error as ApiClientError).message}</p>}
      <Button type="submit" variant="dark" size="lg" disabled={m.isPending}>{m.isPending ? "Signing in…" : "Sign in"}</Button>
      <p className="text-[12.5px] text-muted">Demo account: demo@xiphias.in / Demo1234!</p>
    </form>
  );
}

export function RegisterForm() {
  const qc = useQueryClient();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<RIn, unknown, R>({ resolver: zodResolver(RegisterBody), defaultValues: { marketingOptIn: false, lastName: "" } });
  const m = useMutation({ mutationFn: (b: R) => api.post<Me>("/auth/register", b), onSuccess: (me) => { qc.setQueryData(keys.me, me); router.push("/account"); } });
  return (
    <form onSubmit={handleSubmit((b) => m.mutate(b))} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label>First name<Input {...register("firstName")} /><FieldError>{errors.firstName?.message}</FieldError></Label>
        <Label>Last name<Input {...register("lastName")} /></Label>
      </div>
      <Label>Email<Input type="email" autoComplete="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></Label>
      <Label>Password (8+ characters)<Input type="password" autoComplete="new-password" {...register("password")} /><FieldError>{errors.password?.message}</FieldError></Label>
      <label className="flex items-center gap-2.5 text-[14px]"><input type="checkbox" {...register("marketingOptIn")} className="h-4 w-4 accent-ink" /> Email me recipes and offers</label>
      {m.isError && <p className="text-[13.5px] text-danger">{(m.error as ApiClientError).message}</p>}
      <Button type="submit" variant="dark" size="lg" disabled={m.isPending}>{m.isPending ? "Creating…" : "Create account"}</Button>
    </form>
  );
}
