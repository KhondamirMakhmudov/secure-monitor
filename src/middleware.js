import { NextResponse } from "next/server";

export function middleware(req) {
  // Get the correct cookie name based on environment
  const cookieName = process.env.NODE_ENV === 'production' 
    ? '__Secure-next-auth.session-token.project3'
    : 'next-auth.session-token.project3';
  
  const token = req.cookies.get(cookieName)?.value;

  console.log("Requested Path:", req.nextUrl.pathname);
  console.log("Looking for cookie:", cookieName);
  console.log("Token found:", !!token);

  const protectedRoutes = ["/late-comers", "/secure-section", "/secure-main"];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (!token && isProtected) {
    console.log("Unauthorized - Redirecting to login page");
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/late-comers/:path*", "/secure-section/:path*", "/secure-main/:path*"],
};