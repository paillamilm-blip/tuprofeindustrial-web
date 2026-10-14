"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import {
  TOTAL_STEPS,
  buildDiagnosticoMessage,
  questionAt,
  recommendPlan,
  type DiagnosticoAnswers,
  type QuestionId,
} from "@/lib/diagnostico";

/**
 * Diagnostico interactivo PAES / Ingenieria.
 *
 * Un mini-wizard que avanza pregunta por pregunta, muestra el progreso y, al
 * terminar, entrega el plan recomendado con un CTA de WhatsApp cuyo mensaje
 * resume el diagnostico. Toda la logica vive en lib/diagnostico.ts; aqui solo
 * esta la UI (estado del paso y respuestas).
 */
export function Diagnostico() {
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<DiagnosticoAnswers>({});
  const [done, setDone] = React.useState(false);

  const current = questionAt(step);
  const isLastStep = step === TOTAL_STEPS - 1;

  function choose(questionId: QuestionId, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function next() {
    if (isLastStep) {
      setDone(true);
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function back() {
    if (done) {
      setDone(false);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done) {
    const recommendation = recommendPlan(answers);
    const message = buildDiagnosticoMessage(answers, recommendation);

    return (
      <Card className="mx-auto w-full max-w-xl">
        <CardHeader>
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Tu resultado
          </p>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="size-5 text-accent" aria-hidden="true" />
            {recommendation.title}
          </CardTitle>
          <CardDescription>{recommendation.summary}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-pretty text-muted-foreground">
              {recommendation.rationale}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">
              Conversemos tu plan: te respondo directo por WhatsApp.
            </p>
            <WhatsAppCta
              message={message}
              label="Agendar por WhatsApp"
              ariaLabel="Abrir WhatsApp con el resultado del diagnostico"
            />
          </div>

          <Separator />

          <Button
            type="button"
            variant="ghost"
            className="min-h-11 self-center"
            onClick={restart}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Volver a empezar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;

  const selected = answers[current.id];
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-widest text-primary uppercase">
            Paso {step + 1} de {TOTAL_STEPS}
          </p>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-label={`Progreso del diagnostico: paso ${step + 1} de ${TOTAL_STEPS}`}
        >
          <div
            className="h-full rounded-full bg-accent motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardTitle className="mt-4 text-xl text-balance">
          {current.prompt}
        </CardTitle>
        {current.helper && (
          <CardDescription>{current.helper}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">{current.prompt}</legend>
          {current.options.map((option) => {
            const active = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => choose(current.id, option.value)}
                className={[
                  "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium",
                  "motion-safe:transition-colors motion-safe:duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "border-accent bg-accent/10 text-accent-foreground"
                    : "border-border bg-card hover:border-primary hover:bg-primary/5",
                ].join(" ")}
              >
                <span className="text-pretty">{option.label}</span>
                {active && (
                  <Check className="size-5 shrink-0 text-accent" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={back}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Atras
          </Button>
          <Button
            type="button"
            className="min-h-11"
            onClick={next}
            disabled={!selected}
          >
            {isLastStep ? "Ver mi plan" : "Siguiente"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
