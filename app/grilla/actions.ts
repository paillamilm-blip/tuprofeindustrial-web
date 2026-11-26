"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  GRILLA_SESSION_COOKIE,
  GRILLA_SESSION_TTL_SECONDS,
  createGrillaSessionToken,
  isGrillaPinConfigured,
  verifyGrillaPin,
} from "@/lib/grilla-auth";

export interface UnlockGrillaState {
  ok: boolean;
  error: string | null;
}

export async function unlockGrillaAction(
  _prevState: UnlockGrillaState,
  formData: FormData
): Promise<UnlockGrillaState> {
  const expectedPin = process.env.GRILLA_PIN;
  if (!isGrillaPinConfigured(expectedPin)) {
    return { ok: true, error: null };
  }

  const submitted = String(formData.get("pin") ?? "");
  if (!verifyGrillaPin(submitted, expectedPin!)) {
    return { ok: false, error: "PIN incorrecto. Intenta nuevamente." };
  }

  const token = createGrillaSessionToken(
    expectedPin!,
    process.env.GRILLA_SESSION_SECRET ?? ""
  );

  const cookieStore = await cookies();
  cookieStore.set(GRILLA_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/grilla",
    maxAge: GRILLA_SESSION_TTL_SECONDS,
  });

  revalidatePath("/grilla");
  return { ok: true, error: null };
}

export async function lockGrillaAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(GRILLA_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/grilla",
    maxAge: 0,
  });
  revalidatePath("/grilla");
}
