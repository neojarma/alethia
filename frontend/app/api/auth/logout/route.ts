export async function POST() {
  const response = Response.json({ authenticated: false });
  response.headers.append(
    "Set-Cookie",
    "alethia-demo-role=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
  response.headers.append("Set-Cookie", "alethia-session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  response.headers.append("Set-Cookie", "alethia-auth-context=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  return response;
}
