export function sessionCookieOptions(req) {
  const secure = req.secure || req.get("x-forwarded-proto") === "https";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
  };
}
