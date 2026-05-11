import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_EMAIL } from "@/lib/resend";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get all saved searches with email_alerts = true
  const { data: searches } = await adminClient
    .from("saved_searches")
    .select("id, user_id, name, filters")
    .eq("email_alerts", true);

  if (!searches?.length) return NextResponse.json({ sent: 0 });

  // Get all new listings in the last 24h
  const { data: newListings } = await adminClient
    .from("listings")
    .select("id, slug, title, type, city, price, category, area, rooms")
    .eq("status", "active")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!newListings?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const search of searches) {
    const f = search.filters as Record<string, string>;
    const matches = newListings.filter(l => {
      if (f.type && f.type !== "All" && l.type !== f.type) return false;
      if (f.category && f.category !== "All" && l.category !== f.category) return false;
      if (f.city && f.city !== "All" && l.city !== f.city) return false;
      if (f.minPrice && l.price < Number(f.minPrice)) return false;
      if (f.maxPrice && l.price > Number(f.maxPrice)) return false;
      return true;
    });

    if (!matches.length) continue;

    // Get user email
    const { data: profile } = await adminClient
      .from("profiles")
      .select("email, full_name")
      .eq("id", search.user_id)
      .single();

    if (!profile?.email) continue;

    const listingItems = matches.slice(0, 5).map(l => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
          <a href="https://rentnet.co.ke/properties/${l.slug ?? l.id}" style="color:#7c3aed;font-weight:600;text-decoration:none;">${l.title}</a><br/>
          <span style="font-size:12px;color:#888;">${l.city}${l.category ? ` · ${l.category}` : ""}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">
          <strong style="color:#7c3aed;">KES ${Number(l.price).toLocaleString("en-KE")}</strong>
        </td>
      </tr>
    `).join("");

    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#7c3aed;padding:24px 32px;border-radius:16px 16px 0 0;">
          <h1 style="color:white;margin:0;font-size:20px;">New listings for "${search.name}"</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">${matches.length} new listing${matches.length > 1 ? "s" : ""} match your saved search</p>
        </div>
        <div style="background:white;padding:24px 32px;border:1px solid #f0f0f0;border-top:none;">
          <table style="width:100%;border-collapse:collapse;">${listingItems}</table>
          ${matches.length > 5 ? `<p style="color:#888;font-size:13px;margin:12px 0 0;">And ${matches.length - 5} more matching listings…</p>` : ""}
          <div style="margin-top:24px;text-align:center;">
            <a href="https://rentnet.co.ke/listings${Object.entries(f).filter(([,v]) => v && v !== "All" && v !== "").map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&") ? "?" + Object.entries(f).filter(([,v]) => v && v !== "All" && v !== "").map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&") : ""}"
              style="background:#7c3aed;color:white;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">
              View all matches →
            </a>
          </div>
        </div>
        <div style="padding:16px 32px;text-align:center;font-size:12px;color:#aaa;">
          <a href="https://rentnet.co.ke/dashboard" style="color:#aaa;">Manage saved searches</a> · Rentnet Kenya
        </div>
      </div>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: profile.email,
      subject: `${matches.length} new listing${matches.length > 1 ? "s" : ""} for "${search.name}" on Rentnet`,
      html,
    });

    await adminClient
      .from("saved_searches")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", search.id);

    sent++;
  }

  return NextResponse.json({ sent, total: searches.length });
}
