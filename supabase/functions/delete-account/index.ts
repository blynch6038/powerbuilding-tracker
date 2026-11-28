import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const auth = req.headers.get("Authorization") ?? "";
  const match = /^Bearer (\S+)$/.exec(auth);
  if (!match) return new Response("Authentication required", { status: 401 });
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return new Response("Server unavailable", { status: 503 });
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: identityError } = await admin.auth.getUser(match[1]);
  if (identityError || !user) return new Response("Authentication required", { status: 401 });
  // Deletion is restricted to the authenticated user's own ID, derived from the verified token.
  // Database cascades delete membership, set logs, substitutions, and exercise notes.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return new Response("Unable to delete account. Please contact support.", { status: 500 });
  return new Response(JSON.stringify({ deleted: true }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
});