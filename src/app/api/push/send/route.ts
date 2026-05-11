import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user_id, title, body, url } = await req.json();
  if (!user_id || !title) {
    return NextResponse.json({ error: "user_id and title required" }, { status: 400 });
  }

  const { data: subs } = await adminClient
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", user_id);

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const payload = JSON.stringify({ title, body, url: url || "/" });
  let sent = 0;
  const stale: string[] = [];

  await Promise.all(
    subs.map(async ({ subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          stale.push(subscription.endpoint);
        }
      }
    })
  );

  if (stale.length) {
    await Promise.all(
      stale.map((endpoint) =>
        adminClient
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user_id)
          .filter("subscription->>'endpoint'", "eq", endpoint)
      )
    );
  }

  return NextResponse.json({ sent });
}
