import { NextResponse } from "next/server";
import jwt_decode from "jwt-decode";

export default function Middleware(req) {
  let role;
  let verified;

  try {
    role = jwt_decode(req.cookies.get("appToken").value).sub.role;
  } catch (_error) {
    role = "public";
  }

  try {
    verified = jwt_decode(req.cookies.get("appToken").value).sub.isAuthenticated;
  } catch (_error) {
    verified = false;
  }
  
  const
   url = req.url;
  const { pathname, origin } = req.nextUrl;

  if (!verified && url.includes("/account/user")) {
    return NextResponse.rewrite(`${origin}/account/login`);
  }

  if (!verified && url.includes("/account/editPassword")) {
    return NextResponse.rewrite(`${origin}/account/login`);
  }

  if (!verified && url.includes("/account/editEmail")) {
    return NextResponse.rewrite(`${origin}/account/login`);
  }

  if (!verified && url.includes("/createGame")) {
    return NextResponse.rewrite(`${origin}/account/login`);
  }

  if (!verified && url.includes("/games")) {
    return NextResponse.rewrite(`${origin}/account/login`);
  }

  if (verified && url.includes("/games/postScore")) {
    return NextResponse.rewrite(`${origin}/account/user`);
  }

  if (verified && url.includes("/account/login")) {
    return NextResponse.rewrite(`${origin}`);
  }

  if (verified && url.includes("/account/register")) {
    return NextResponse.rewrite(`${origin}`);
  }

  if (role !== "admin" && url.includes("/admin")) {
    return NextResponse.rewrite(`${origin}`);
  }

}
