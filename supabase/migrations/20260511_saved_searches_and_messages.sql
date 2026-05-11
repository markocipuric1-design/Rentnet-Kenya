-- ── Saved searches ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_searches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text NOT NULL DEFAULT 'My search',
  filters       jsonb NOT NULL DEFAULT '{}',
  email_alerts  boolean NOT NULL DEFAULT false,
  last_notified_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved searches"
  ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- ── Conversations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id       uuid REFERENCES listings(id) ON DELETE SET NULL,
  last_message_at  timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participant_1, participant_2)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can see their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ── Messages ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body            text NOT NULL,
  read_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversation participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Senders can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Recipients can mark as read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  )
  WITH CHECK (true);

-- ── Push subscriptions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_user_endpoint_idx
  ON push_subscriptions (user_id, (subscription->>'endpoint'));

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subscriptions"
  ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
