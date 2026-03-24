import { NextResponse } from "next/server"
import { logRequest } from "@/utils/logRequest"

export async function POST(req: Request) {
  const start = Date.now();
  const body = await req.json();
  try {
    const duration = Date.now() - start;

    await logRequest({ ...body, duration, status: body.status });
    return NextResponse.json({ success: true });
    
  } catch (error) {
    const duration = Date.now() - start;
    console.error("Error logging request:", error);

    await logRequest({ ...body, duration, status: body.status });

    return NextResponse.json({ success: false }, { status: 500 });
  }
}