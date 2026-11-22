"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold">QR Yönetimi</h1>
          <p className="text-sm text-muted">Devam etmek için şifreni gir.</p>
        </div>
        <input
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
          placeholder="Şifre"
          className="input"
        />
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending} className="btn btn-primary w-full">
          {pending ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
    </main>
  );
}
