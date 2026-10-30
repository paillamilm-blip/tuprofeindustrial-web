"use client";

import * as React from "react";
import { FileDown } from "lucide-react";

import { suscribirSimulacro, type LeadState } from "@/app/actions/lead";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import {
  SIMULACRO_PDF_PATH,
  buildLeadWhatsAppMessage,
  type LeadOutcome,
} from "@/lib/lead";

const INITIAL_STATE: LeadState = { status: "idle" };

/**
 * Formulario de captura del Simulacro M1.
 *
 * Pide nombre, correo y consentimiento (Ley 21.719), registra al alumno en la
 * lista de MailerLite desde el servidor y libera la descarga del PDF. Si el alta
 * no ocurrió, muestra el mismo botón de descarga con la explicación honesta:
 * nunca se finge un correo que no va a llegar.
 */
export function SimulacroForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [state, formAction, pending] = React.useActionState(
    suscribirSimulacro,
    INITIAL_STATE
  );

  const errors = state.status === "error" ? state.errors : {};

  if (state.status === "ok" || state.status === "solo-descarga") {
    return (
      <DownloadPanel
        name={name}
        registered={state.status === "ok"}
        message={state.status === "solo-descarga" ? state.message : null}
        outcome={state.status === "solo-descarga" ? state.reason : "registrado"}
      />
    );
  }

  return (
    <Card className="relative mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Simulacro M1 gratis</CardTitle>
        <CardDescription>
          20 ítems con solucionario, en el formato de la prueba. Te lo mando al
          correo y queda en tu pantalla para descargar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-5" noValidate>
          {/* Trampapolilla: lo ve el bot, no el alumno. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          >
            <label htmlFor="lead-website">No completar</label>
            <input
              id="lead-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value=""
              onChange={() => undefined}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-name">Nombre</Label>
            <Input
              id="lead-name"
              name="name"
              type="text"
              placeholder="Ej: Ana Torres"
              autoComplete="name"
              className="min-h-11"
              value={name}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "lead-name-error" : undefined}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <p
                id="lead-name-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-email">Correo</Label>
            <Input
              id="lead-email"
              name="email"
              type="email"
              inputMode="email"
              placeholder="Ej: ana.torres@gmail.com"
              autoComplete="email"
              className="min-h-11"
              value={email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "lead-email-error" : undefined}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p
                id="lead-email-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                id="lead-consent"
                name="consent"
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-primary"
                checked={consent}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={
                  errors.consent ? "lead-consent-error" : undefined
                }
                onChange={(e) => setConsent(e.target.checked)}
              />
              <Label htmlFor="lead-consent" className="font-normal">
                Acepto que Tu Profe Industrial guarde mi correo para enviarme el
                simulacro y material de preparación PAES. Puedo pedir que me
                borren cuando quiera.
              </Label>
            </div>
            {errors.consent && (
              <p
                id="lead-consent-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {errors.consent}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Tus datos se usan solo para eso (Ley 21.719). Sin spam y con baja
              en un clic.
            </p>
          </div>

          <Button
            type="submit"
            className="min-h-11 w-full"
            disabled={pending}
          >
            {pending ? "Enviando…" : "Enviarme el simulacro gratis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface DownloadPanelProps {
  name: string;
  /** true si MailerLite confirmó el alta en la lista. */
  registered: boolean;
  /** Aviso cuando el alta no ocurrió; null si todo salió bien. */
  message: string | null;
  /** Como terminó el alta: define que el alumno escriba en WhatsApp. */
  outcome: LeadOutcome;
}

/**
 * Pantalla que ve el alumno después de enviar: el PDF listo para descargar, más
 * el CTA de WhatsApp para coordinar la corrección (ahí está el ingreso real).
 */
function DownloadPanel({
  name,
  registered,
  message,
  outcome,
}: DownloadPanelProps) {
  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <FileDown className="size-5 text-primary" aria-hidden="true" />
          <span>Tu simulacro está listo</span>
        </CardTitle>
        <CardDescription>
          Descárgalo, resuélvelo sin calculadora y anota tus errores en la tabla
          del final.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {registered ? (
          <p role="status" className="text-sm text-muted-foreground">
            También quedaste en la lista: te escribo cuando salgan más materiales
            PAES.
          </p>
        ) : (
          <p
            role="status"
            className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-pretty"
          >
            {message}
          </p>
        )}

        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
          <p className="font-mono text-sm font-semibold text-foreground">
            simulacro-paes-m1.pdf
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            20 ítems · solucionario incluido
          </p>
          <Button asChild className="mt-4 min-h-11 w-full">
            <a href={SIMULACRO_PDF_PATH} download>
              Descargar el simulacro (PDF)
            </a>
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Quieres que revise tus errores uno a uno? Mándame la foto de la
            tabla por WhatsApp.
          </p>
          <WhatsAppCta
            message={buildLeadWhatsAppMessage(name, outcome)}
            label="Quiero corrección por WhatsApp"
            ariaLabel="Abrir WhatsApp para coordinar la corrección del simulacro"
          />
        </div>
      </CardContent>
    </Card>
  );
}
