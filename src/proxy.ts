import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/config/site";
import { ADMIN_SEEN_COOKIE } from "@/lib/admin-cookie";
import { buildCsp } from "@/lib/csp";


/**
 * Runs before every page request:
 *  1. Creates a per-request CSP nonce (so only our own scripts can run).
 *  2. On /admin pages, refreshes the Supabase session and enforces the idle
 *     timeout and maximum session length. (Admin role + MFA are re-checked on
 *     the server by requireAdmin() in every admin page and action.)
 */
export async function proxy(request: NextRequest) {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const csp = buildCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (request.nextUrl.pathname.startsWith("/admin")) {
    response = await adminSession(request, requestHeaders, response);
  }

  response.headers.set("Content-Security-Policy", csp);
  return response;
}

async function adminSession(request: NextRequest, requestHeaders: Headers, initial: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return initial;

  let response = initial;
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const path = request.nextUrl.pathname;
  const isPublicAdminPath = path === "/admin/login";

  if (!user) {
    if (isPublicAdminPath) return response;
    return redirectWithCookies(request, response, "/admin/login");
  }

  const now = Date.now();
  const seen = Number(request.cookies.get(ADMIN_SEEN_COOKIE)?.value ?? 0);
  const idleExpired = !seen || now - seen > SITE.adminIdleMinutes * 60_000;
  const signedInAt = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
  const tooOld = now - signedInAt > SITE.adminMaxSessionHours * 3_600_000;

  if ((idleExpired || tooOld) && !isPublicAdminPath) {
    await supabase.auth.signOut();
    const redirect = redirectWithCookies(request, response, "/admin/login?reason=timeout");
    redirect.cookies.delete(ADMIN_SEEN_COOKIE);
    return redirect;
  }

  if (!isPublicAdminPath) {
    response.cookies.set(ADMIN_SEEN_COOKIE, String(now), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/admin",
      maxAge: SITE.adminIdleMinutes * 60,
    });
  }
  return response;
}

function redirectWithCookies(request: NextRequest, from: NextResponse, to: string) {
  const redirect = NextResponse.redirect(new URL(to, request.url));
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
