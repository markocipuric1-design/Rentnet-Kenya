import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: userError?.message ?? "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", user.id)
      .single();

    if (profile?.account_type !== "administrator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json() as { id: string; [key: string]: unknown };
    const { id, ...payload } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Decode JWT to verify it's the service_role key (not anon)
    try {
      const jwtPayload = JSON.parse(Buffer.from(serviceKey.split(".")[1], "base64url").toString());
      console.log("[admin/update-partner] key role:", jwtPayload.role, "| updating id:", id);
    } catch {
      console.log("[admin/update-partner] could not decode service key");
    }

    console.log("[admin/update-partner] payload keys:", Object.keys(payload));
    console.log("[admin/update-partner] metadata:", JSON.stringify(payload.metadata));

    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/partners?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
          "apikey": serviceKey,
          "Prefer": "return=representation",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const responseText = await updateRes.text();

    if (!updateRes.ok) {
      console.error("[admin/update-partner] PostgREST error:", updateRes.status, responseText);
      return NextResponse.json({ error: responseText || `HTTP ${updateRes.status}` }, { status: 500 });
    }

    // Check how many rows were actually updated
    let updatedRows: unknown[] = [];
    try { updatedRows = JSON.parse(responseText); } catch { /* ignore */ }

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      console.warn("[admin/update-partner] 0 rows updated — id may not exist or RLS is blocking:", id);
      return NextResponse.json({ error: "No rows updated. Check that the partner id exists." }, { status: 404 });
    }

    console.log("[admin/update-partner] updated", updatedRows.length, "row(s) for id:", id);

    // Bust Next.js page cache so the partner detail page shows fresh data
    revalidatePath("/partners/[category]/[id]", "page");
    revalidatePath("/admin/partners");

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/update-partner] caught error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
