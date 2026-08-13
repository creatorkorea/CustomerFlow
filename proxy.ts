import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const proxy = auth((request) => {
  if (!request.auth) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/consultations/:path*",
    "/reservations/:path*",
    "/follow-ups/:path*",
    "/notifications/:path*",
    "/settings/:path*"
  ]
};
