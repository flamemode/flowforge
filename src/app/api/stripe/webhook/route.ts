import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  // Idempotency
  const { data: existing } = await supabase
    .from("stripe_events").select("id").eq("id", event.id).single();
  if (existing) return NextResponse.json({ received: true });
  await supabase.from("stripe_events").insert({ id: event.id, type: event.type });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const credits = Number(session.metadata?.credits ?? 0);
      const packId = session.metadata?.pack_id;

      if (!userId) break;

      if (session.mode === "payment" && credits > 0) {
        // Credit purchase
        await supabase.rpc("add_credits", { user_uuid: userId, amount: credits });
        await supabase.from("credit_purchases").insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          pack_id: packId,
          credits,
          amount_paid: session.amount_total ?? 0,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
