"use client";

import * as React from "react";
import { Target, TrendingUp, Trophy } from "lucide-react";

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
  PAES_MAX,
  PAES_MIN,
  buildPaesMessage,
  simulatePaesGoal,
  type PaesResult,
} from "@/lib/paes";

/** Normaliza un input numerico chileno a numero (coma -> punto). */
function toNumber(value: string): number {
  return Number(value.trim().replace(",", "."));
}

/**
 * Simulador de meta PAES.
 *
 * El alumno ingresa su puntaje actual y su objetivo; el componente calcula
 * cuanto debe subir y recomienda el intensivo o el refuerzo que mas le conviene
 * usando la logica pura de lib/paes.ts. Termina en un CTA de WhatsApp con el
 * resultado precargado.
 */
export function PaesSimulator() {
  const [current, setCurrent] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [currentError, setCurrentError] = React.useState<string | null>(null);
  const [goalError, setGoalError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<PaesResult | null>(null);

  function calcular() {
    const currentNum = toNumber(current);
    const goalNum = toNumber(goal);

    let hasError = false;

    if (current.trim() === "" || Number.isNaN(currentNum)) {
      setCurrentError("Ingresa tu puntaje actual.");
      hasError = true;
    } else if (currentNum < PAES_MIN || currentNum > PAES_MAX) {
      setCurrentError(`El puntaje debe estar entre ${PAES_MIN} y ${PAES_MAX}.`);
      hasError = true;
    } else {
      setCurrentError(null);
    }

    if (goal.trim() === "" || Number.isNaN(goalNum)) {
      setGoalError("Ingresa tu puntaje objetivo.");
      hasError = true;
    } else if (goalNum < PAES_MIN || goalNum > PAES_MAX) {
      setGoalError(`El puntaje debe estar entre ${PAES_MIN} y ${PAES_MAX}.`);
      hasError = true;
    } else {
      setGoalError(null);
    }

    if (hasError) {
      setResult(null);
      return;
    }

    setResult(simulatePaesGoal({ current: currentNum, goal: goalNum }));
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Simulador de meta PAES</CardTitle>
        <CardDescription>
          Escala de {PAES_MIN} a {PAES_MAX} puntos. Compara tu puntaje actual
          con tu meta y descubre cuanto debes subir.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="paes-current">Puntaje actual</Label>
            <Input
              id="paes-current"
              inputMode="numeric"
              placeholder="Ej: 550"
              className="min-h-11 font-mono tabular-nums"
              value={current}
              aria-invalid={currentError ? true : undefined}
              aria-describedby={currentError ? "paes-current-error" : undefined}
              onChange={(e) => setCurrent(e.target.value)}
            />
            {currentError && (
              <p
                id="paes-current-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {currentError}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="paes-goal">Puntaje objetivo</Label>
            <Input
              id="paes-goal"
              inputMode="numeric"
              placeholder="Ej: 700"
              className="min-h-11 font-mono tabular-nums"
              value={goal}
              aria-invalid={goalError ? true : undefined}
              aria-describedby={goalError ? "paes-goal-error" : undefined}
              onChange={(e) => setGoal(e.target.value)}
            />
            {goalError && (
              <p
                id="paes-goal-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {goalError}
              </p>
            )}
          </div>
        </div>

        <Button type="button" onClick={calcular} className="min-h-11 w-full">
          Calcular mi meta
        </Button>

        {result && !result.outOfRange && (
          <>
            <div
              className={[
                "rounded-lg border p-5 text-center",
                result.goalNotAbove
                  ? "border-accent bg-accent/10"
                  : "border-primary/30 bg-primary/5",
              ].join(" ")}
            >
              {result.goalNotAbove ? (
                <Trophy
                  className="mx-auto size-6 text-accent"
                  aria-hidden="true"
                />
              ) : (
                <TrendingUp
                  className="mx-auto size-6 text-primary"
                  aria-hidden="true"
                />
              )}
              {!result.goalNotAbove && (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Debes subir
                  </p>
                  <p className="font-mono text-4xl font-bold tabular-nums text-foreground">
                    {result.delta}
                  </p>
                  <p className="text-sm text-muted-foreground">puntos</p>
                </>
              )}
              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold">
                <Target className="size-4 text-primary" aria-hidden="true" />
                <span>Plan recomendado: {result.recommendationTitle}</span>
              </div>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {result.message}
              </p>
            </div>

            <Separator />

            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-muted-foreground">
                Armemos tu plan para llegar a la meta.
              </p>
              <WhatsAppCta
                message={buildPaesMessage(result)}
                label="Preparar la PAES por WhatsApp"
                ariaLabel="Abrir WhatsApp con tu simulacion PAES"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
