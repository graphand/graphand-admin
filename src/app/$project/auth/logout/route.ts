import { NextResponse } from "next/server";

export async function POST() {
  // Create response
  const response = NextResponse.json({ success: true });

  // Clear the auth token cookie
  response.cookies.set("token", "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}
