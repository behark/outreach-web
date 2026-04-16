import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { lead_key, status, note, template, language } = data;

    if (!lead_key) {
      return NextResponse.json({ error: "Missing lead_key" }, { status: 400 });
    }

    // Create history entry
    await prisma.outreachStatusHistory.create({
      data: {
        leadKey: lead_key,
        status,
        note,
        template,
        language,
        timestampUtc: new Date()
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
