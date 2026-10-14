"use client";

import * as React from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import {
  MAX_GRADE,
  MIN_GRADE,
  PASSING_GRADE,
  passes,
  requiredGrade,
  weightedAverage,
  type GradeItem,
} from "@/lib/grades";

/** Fila editable del formulario (valores como string para la UI). */
interface Row {
  id: number;
  grade: string;
  weight: string;
}

let rowCounter = 0;
function newRow(grade = "", weight = ""): Row {
  rowCounter += 1;
  return { id: rowCounter, grade, weight };
}

/** Convierte las filas en GradeItem[], ignorando filas vacias. */
function parseRows(rows: Row[]): { items: GradeItem[]; hasPartial: boolean } {
  const items: GradeItem[] = [];
  let hasPartial = false;

  for (const row of rows) {
    const gradeRaw = row.grade.trim().replace(",", ".");
    const weightRaw = row.weight.trim().replace(",", ".");

    if (gradeRaw === "" && weightRaw === "") {
      continue;
    }
    if (gradeRaw === "" || weightRaw === "") {
      hasPartial = true;
      continue;
    }

    const grade = Number(gradeRaw);
    const weight = Number(weightRaw);
    if (Number.isNaN(grade) || Number.isNaN(weight)) {
      hasPartial = true;
      continue;
    }
    items.push({ grade, weight });
  }

  return { items, hasPartial };
}

function GradeWeightRows({
  rows,
  setRows,
  weightLabel,
}: {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  weightLabel: string;
}) {
  function updateRow(id: number, field: "grade" | "weight", value: string) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function removeRow(id: number) {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 text-xs font-medium text-muted-foreground">
        <span>Nota (1.0 - 7.0)</span>
        <span>{weightLabel}</span>
        <span className="sr-only">Acciones</span>
      </div>
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
        >
          <Input
            inputMode="decimal"
            placeholder="Ej: 5.5"
            aria-label={`Nota de la evaluacion ${index + 1}`}
            value={row.grade}
            onChange={(e) => updateRow(row.id, "grade", e.target.value)}
          />
          <Input
            inputMode="decimal"
            placeholder="Ej: 30"
            aria-label={`Ponderacion de la evaluacion ${index + 1}`}
            value={row.weight}
            onChange={(e) => updateRow(row.id, "weight", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Eliminar evaluacion ${index + 1}`}
            disabled={rows.length <= 1}
            onClick={() => removeRow(row.id)}
          >
            &times;
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setRows((prev) => [...prev, newRow()])}
      >
        + Agregar evaluacion
      </Button>
    </div>
  );
}

function AverageMode() {
  const [rows, setRows] = React.useState<Row[]>([
    newRow("", ""),
    newRow("", ""),
  ]);
  const [result, setResult] = React.useState<
    | { ok: true; average: number; approved: boolean }
    | { ok: false; error: string }
    | null
  >(null);

  function calcular() {
    const { items, hasPartial } = parseRows(rows);
    if (items.length === 0) {
      setResult({
        ok: false,
        error: "Ingresa al menos una evaluacion con nota y ponderacion.",
      });
      return;
    }
    try {
      const average = weightedAverage(items);
      setResult({
        ok: true,
        average,
        approved: passes(average),
      });
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : "Revisa los datos ingresados.",
      });
    }
    void hasPartial;
  }

  return (
    <div className="flex flex-col gap-5">
      <GradeWeightRows
        rows={rows}
        setRows={setRows}
        weightLabel="Ponderacion (%)"
      />
      <Button type="button" onClick={calcular} className="w-full">
        Calcular mi promedio
      </Button>

      {result && !result.ok && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {result.error}
        </p>
      )}

      {result && result.ok && (
        <div
          className={`rounded-lg border p-4 text-center ${
            result.approved
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="text-sm">Tu promedio ponderado es</p>
          <p className="text-4xl font-bold tabular-nums">
            {result.average.toFixed(1)}
          </p>
          <p className="mt-1 text-sm font-medium">
            {result.approved
              ? `Aprobado (igual o sobre ${PASSING_GRADE.toFixed(1)})`
              : `Reprobado (bajo ${PASSING_GRADE.toFixed(1)})`}
          </p>
        </div>
      )}
    </div>
  );
}

function RequiredMode() {
  const [rows, setRows] = React.useState<Row[]>([
    newRow("", ""),
    newRow("", ""),
  ]);
  const [remainingWeight, setRemainingWeight] = React.useState("");
  const [target, setTarget] = React.useState(PASSING_GRADE.toFixed(1));
  const [result, setResult] = React.useState<
    | {
        ok: true;
        required: number;
        requiredClamped: number;
        impossible: boolean;
        secured: boolean;
        target: number;
      }
    | { ok: false; error: string }
    | null
  >(null);

  function calcular() {
    const { items } = parseRows(rows);
    if (items.length === 0) {
      setResult({
        ok: false,
        error: "Ingresa al menos una nota ya rendida con su ponderacion.",
      });
      return;
    }

    const remaining = Number(remainingWeight.trim().replace(",", "."));
    if (remainingWeight.trim() === "" || Number.isNaN(remaining)) {
      setResult({
        ok: false,
        error: "Ingresa la ponderacion de la evaluacion que te queda.",
      });
      return;
    }

    const targetNum = Number(target.trim().replace(",", "."));
    if (target.trim() === "" || Number.isNaN(targetNum)) {
      setResult({ ok: false, error: "Ingresa una nota objetivo valida." });
      return;
    }

    try {
      const r = requiredGrade({
        currentItems: items,
        remainingWeight: remaining,
        target: targetNum,
      });
      setResult({ ok: true, ...r, target: targetNum });
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : "Revisa los datos ingresados.",
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <GradeWeightRows
        rows={rows}
        setRows={setRows}
        weightLabel="Ponderacion (%)"
      />

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="remaining-weight">
            Ponderacion de la evaluacion restante (%)
          </Label>
          <Input
            id="remaining-weight"
            inputMode="decimal"
            placeholder="Ej: 40"
            value={remainingWeight}
            onChange={(e) => setRemainingWeight(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="target-grade">Nota final que quieres</Label>
          <Input
            id="target-grade"
            inputMode="decimal"
            placeholder={PASSING_GRADE.toFixed(1)}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
      </div>

      <Button type="button" onClick={calcular} className="w-full">
        Calcular que nota necesito
      </Button>

      {result && !result.ok && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {result.error}
        </p>
      )}

      {result && result.ok && result.impossible && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-900">
          <p className="text-sm">
            Necesitarias un {result.required.toFixed(1)} en la evaluacion
            restante.
          </p>
          <p className="mt-1 text-base font-semibold">
            No es posible alcanzar un {result.target.toFixed(1)}: la nota maxima
            es {MAX_GRADE.toFixed(1)}.
          </p>
        </div>
      )}

      {result && result.ok && result.secured && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-emerald-900">
          <p className="text-base font-semibold">
            Ya tienes asegurado el {result.target.toFixed(1)}.
          </p>
          <p className="mt-1 text-sm">
            Incluso sacando la nota minima ({MIN_GRADE.toFixed(1)}) alcanzas tu
            objetivo.
          </p>
        </div>
      )}

      {result && result.ok && !result.impossible && !result.secured && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-center text-sky-900">
          <p className="text-sm">
            Para lograr un {result.target.toFixed(1)} necesitas sacar
          </p>
          <p className="text-4xl font-bold tabular-nums">
            {result.requiredClamped.toFixed(1)}
          </p>
          <p className="mt-1 text-sm">en la evaluacion restante.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Calculadora de notas interactiva (escala chilena 1.0 - 7.0).
 * Dos modos: calcular el promedio ponderado y "que nota necesito".
 */
export function GradeCalculator() {
  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Calculadora de notas</CardTitle>
        <CardDescription>
          Escala chilena de {MIN_GRADE.toFixed(1)} a {MAX_GRADE.toFixed(1)}.
          Aprobacion desde {PASSING_GRADE.toFixed(1)}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="promedio" className="gap-6">
          <TabsList className="w-full">
            <TabsTrigger value="promedio">Mi promedio</TabsTrigger>
            <TabsTrigger value="necesito">Que nota necesito</TabsTrigger>
          </TabsList>
          <TabsContent value="promedio">
            <AverageMode />
          </TabsContent>
          <TabsContent value="necesito">
            <RequiredMode />
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Te quedo dando vueltas? Un profe te ayuda al tiro.
          </p>
          <WhatsAppCta
            message="Hola! Use la calculadora de notas en la web y quiero ayuda para subir mis notas."
            label="Pedir ayuda por WhatsApp"
          />
        </div>
      </CardContent>
    </Card>
  );
}
