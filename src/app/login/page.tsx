"use client";

import { useActionState } from "react";
import { Brand } from "@/components/Brand";
import { IconWarn } from "@/components/icons";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <main className="stage grid min-h-screen place-items-center px-4">
      <form action={action} className="panel w-full max-w-sm p-7">
        <Brand />
        <h1 className="mt-6 text-xl font-bold">Tekrar hoş geldin</h1>
        <p className="mt-1 text-sm text-muted">Kodlarını yönetmek için şifreni gir.</p>
        <label htmlFor="password" className="label mt-6">Şifre</label>
        <input
          id="password"
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          className="input"
        />
        {state.error && (
          <p className="notice mt-3 bg-danger-soft text-danger" role="alert">
            <IconWarn />
            {state.error}
          </p>
        )}
        <button disabled={pending} className="btn btn-primary mt-5 w-full">
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
