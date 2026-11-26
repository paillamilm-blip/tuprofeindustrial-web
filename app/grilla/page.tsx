import { Suspense } from "react";
import { cookies } from "next/headers";
import {
  DAYS_DATA,
  QUICK_APPS,
  QUOTES_WA,
  CONVOCATORIAS_BASE,
  SUPERPROF_URL,
  FORMULARIO_MAESTRO_PDF,
  SIMULACRO_M1_PDF,
} from "./grilla-data";
import syncedDataRaw from "./synced-data.json";
import { GrillaCockpitClient } from "./grilla-cockpit-client";
import { PinGate } from "./pin-gate";
import {
  GRILLA_SESSION_COOKIE,
  isGrillaPinConfigured,
  verifyGrillaSessionToken,
} from "@/lib/grilla-auth";
import type { SyncedGrillaData } from "@/lib/grilla-sync";

async function GrillaServerGate() {
  const cookieStore = await cookies();
  const configuredPin = process.env.GRILLA_PIN;
  const pinProtected = isGrillaPinConfigured(configuredPin);

  if (pinProtected) {
    const sessionToken = cookieStore.get(GRILLA_SESSION_COOKIE)?.value;
    const isUnlocked = verifyGrillaSessionToken(
      sessionToken,
      configuredPin!,
      process.env.GRILLA_SESSION_SECRET ?? ""
    );
    if (!isUnlocked) {
      return <PinGate />;
    }
  }

  return (
    <GrillaCockpitClient
      daysData={DAYS_DATA}
      quickApps={QUICK_APPS}
      quotesWa={QUOTES_WA}
      convocatoriasBase={CONVOCATORIAS_BASE}
      superprofUrl={SUPERPROF_URL}
      formularioMaestroPdf={FORMULARIO_MAESTRO_PDF}
      simulacroM1Pdf={SIMULACRO_M1_PDF}
      syncedData={syncedDataRaw as SyncedGrillaData}
      isPinProtected={pinProtected}
    />
  );
}

export default function GrillaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs font-mono text-slate-500">
          Cargando cockpit operativo…
        </div>
      }
    >
      <GrillaServerGate />
    </Suspense>
  );
}
