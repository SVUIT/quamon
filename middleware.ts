import { NextResponse } from "next/server"

function shouldLog(path: string, method: string, userAgent: string) {
  if(path.startsWith("/_next")||path.startsWith("/api/log")||path.startsWith("/static")||path.startsWith("/images")) return false
  if(path === "/favicon.ico" || path === "/robots.txt" || path === "/manifest.json") return false
  if(method === "OPTIONS") return false
  if(userAgent && /bot|crawler|spider|crawling/i.test(userAgent)) return false

  return true
}

export async function middleware(req: Request) {
  const path = new URL(req.url).pathname;
  const method = req.method;
  const userAgent = req.headers.get("user-agent") || "unknown";
  

  if (!shouldLog(path, method, userAgent)) {
    return NextResponse.next()
  }
  
  const response = NextResponse.next(); 

  const log = {
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
    path,
    method,
    userAgent,
    status: response.status,
  }

  const baseUrl = process.env.BASE_URL || "http://localhost:3000"

  fetch(`${baseUrl}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  }).catch((error) => {
    console.error("Logging error:", error);
  });
  return response;
}