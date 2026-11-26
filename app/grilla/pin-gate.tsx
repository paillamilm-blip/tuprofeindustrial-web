"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { unlockGrillaAction, type UnlockGrillaState } from "./actions";

const INITIAL_STATE: UnlockGrillaState = { ok: false, error: null };

export function PinGate() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(unlockGrillaAction, INITIAL_STATE);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="space-y-1.5 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            🔒
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            Cockpit Privado · @tuprofeindustrial
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ingresa tu PIN operativo (<code className="bg-slate-100 px-1 py-0.5 rounded">GRILLA_PIN</code>) para desbloquear la programación, copies y métricas privadas.
          </p>
        </div>

        <form action={formAction} className="space-y-3">
          <div>
            <label htmlFor="grilla-pin" className="sr-only">
              PIN de acceso
            </label>
            <input
              id="grilla-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              required
              placeholder="••••"
              className="w-full min-h-[48px] rounded-2xl border border-slate-300 bg-slate-50 px-4 text-center text-xl font-bold tracking-[0.35em] text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 text-center"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full min-h-[48px] rounded-2xl bg-slate-900 text-white text-sm font-semibold active:scale-[0.99] transition disabled:opacity-60"
          >
            {pending ? "Verificando PIN…" : "Desbloquear cockpit"}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400">
          Validación en servidor con cookie HttpOnly · 30 días en este navegador.
        </p>
      </div>
    </main>
  );
}
