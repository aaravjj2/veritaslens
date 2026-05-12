import { NextResponse } from "next/server";
import { sources } from "@/lib/sources";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ sources });
}
