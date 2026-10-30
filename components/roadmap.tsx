"use client";

import * as React from "react";
import { Flag, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { MILESTONES, buildRoute, getMilestone } from "@/lib/roadmap";

/**
 * Ruta de aprendizaje visual.
 *
 * El alumno elige su nivel actual y su meta; el componente resalta el tramo
 * recorrido usando buildRoute (logica pura en lib/roadmap.ts). Refuerza la
 * idea de marca "Aprender es para todos": siempre hay una ruta.
 */
export function Roadmap() {
  const [startId, setStartId] = React.useState(MILESTONES[0].id);
  const [goalId, setGoalId] = React.useState(
    MILESTONES[MILESTONES.length - 1].id
  );

  const route = buildRoute(startId, goalId);
  const inSegment = (id: string) => route.segment.includes(id);

  const startLabel = getMilestone(startId)?.label ?? "";
  const goalLabel = getMilestone(goalId)?.label ?? "";

  const whatsappMessage = route.invalid
    ? "Hola! Quiero armar mi ruta de aprendizaje con TuProfeIndustrial."
    : `Hola! Arme mi ruta de aprendizaje en la web de TuProfeIndustrial: ` +
      `desde ${startLabel} hasta ${goalLabel}. Quiero empezar.`;

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Arma tu ruta de aprendizaje</CardTitle>
        <CardDescription>
          Elige donde estas hoy y hasta donde quieres llegar. Aprender es para
          todos: siempre hay un camino.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="roadmap-start">Mi nivel actual</Label>
            <Select value={startId} onValueChange={setStartId}>
              <SelectTrigger
                id="roadmap-start"
                className="min-h-11 w-full"
              >
                <SelectValue placeholder="Elige tu nivel" />
              </SelectTrigger>
              <SelectContent>
                {MILESTONES.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="roadmap-goal">Mi meta</Label>
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger id="roadmap-goal" className="min-h-11 w-full">
                <SelectValue placeholder="Elige tu meta" />
              </SelectTrigger>
              <SelectContent>
                {MILESTONES.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {route.invalid && (
          <p role="alert" className="text-sm font-medium text-destructive">
            Tu meta esta antes de tu nivel actual. Elige una meta posterior
            para ver tu ruta.
          </p>
        )}

        <ol className="flex flex-col gap-0" aria-label="Hitos de la ruta de aprendizaje">
          {MILESTONES.map((m, index) => {
            const active = inSegment(m.id);
            const isStart = m.id === startId && !route.invalid;
            const isGoal = m.id === goalId && !route.invalid;
            const isLast = index === MILESTONES.length - 1;

            return (
              <li key={m.id} className="flex gap-4">
                {/* Nodo + conector vertical */}
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={[
                      "flex size-11 shrink-0 items-center justify-center rounded-full border-2",
                      "motion-safe:transition-colors motion-safe:duration-300",
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-card text-muted-foreground",
                    ].join(" ")}
                  >
                    {isGoal ? (
                      <Flag className="size-5" />
                    ) : isStart ? (
                      <MapPin className="size-5" />
                    ) : (
                      <span className="font-mono text-sm tabular-nums">
                        {index + 1}
                      </span>
                    )}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={[
                        "w-0.5 flex-1 motion-safe:transition-colors motion-safe:duration-300",
                        active && inSegment(MILESTONES[index + 1].id)
                          ? "bg-accent"
                          : active
                            ? "bg-primary"
                            : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </div>

                {/* Contenido del hito */}
                <div
                  className="flex flex-col gap-1 pb-6"
                  aria-current={isStart || isGoal ? "step" : undefined}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "font-display font-semibold",
                        active ? "text-foreground" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {m.label}
                    </span>
                    {isStart && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                        Partes aqui
                      </span>
                    )}
                    {isGoal && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                        Tu meta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-pretty text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <Separator />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            {route.invalid
              ? "Ajusta tu meta y conversemos como llegar."
              : `Tu ruta: ${route.segment.length} ${route.segment.length === 1 ? "etapa" : "etapas"}. Empecemos hoy.`}
          </p>
          <WhatsAppCta
            message={whatsappMessage}
            label="Empezar mi ruta por WhatsApp"
            ariaLabel="Abrir WhatsApp con tu ruta de aprendizaje"
          />
        </div>
      </CardContent>
    </Card>
  );
}
