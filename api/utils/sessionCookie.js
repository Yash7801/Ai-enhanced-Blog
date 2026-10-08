export function sessionCookieOptions(req) {
  const secure = req.secure || req.get("x-forwarded-proto") === "https";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    // Matches the JWT's 7-day lifetime; Express 5's clearCookie ignores maxAge.
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}
