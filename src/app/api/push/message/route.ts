import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversation_id, body } = await req.json();
  if (!conversation_id) return NextResponse.json({ error: "conversation_id required" }, { status: 400 });

  const { data: conv } = await adminClient
    .from("conversations")
    .select(`participant_1, participant_2,
      p1:profiles!participant_1(full_name),
      p2:profiles!participant_2(full_name)`)
    .eq("id", conversation_id)
    .single();

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (conv.participant_1 !== user.id && conv.participant_2 !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const recipientId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const senderProfile = conv.participant_1 === user.id ? (conv as any).p1 : (conv as any).p2;
  const senderName: string = senderProfile?.full_name ?? "Someone";

  const { data: subs } = await adminClient
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", recipientId);

  if (!subs?.length) return NextResponse.json({ sent: 0 });

  const payload = JSON.stringify({
    title: `New message from ${senderName}`,
    body: (body as string)?.slice(0, 120) ?? "",
    url: `/dashboard/messages/${conversation_id}`,
  });

  const stale: string[] = [];
  await Promise.all(
    subs.map(async ({ subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload);
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) stale.push(subscription.endpoint);
      }
    })
  );

  if (stale.length) {
    await Promise.all(
      stale.map((endpoint) =>
        adminClient
          .from("push_subscriptions")
          .delete()
          .eq("user_id", recipientId)
          .filter("subscription->>'endpoint'", "eq", endpoint)
      )
    );
  }

  return NextResponse.json({ ok: true });
}
