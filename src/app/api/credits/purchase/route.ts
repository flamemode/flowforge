import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { CREDIT_PACKS } from "@/lib/constants";
import { z } from "zod";

const schema = z.object({
  pack_id: z.enum(["starter", "studio", "agency"]),
});

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid pack" }, { status: 400 });

  const pack = CREDIT_PACKS.find((p) => p.id === parsed.data.pack_id);
  if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

  const stripe = getStripe();

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: pack.price * 100,
        product_data: {
          name: `FlowForge ${pack.name}`,
          description: `${pack.credits} project run${pack.credits > 1 ? "s" : ""} — simulate + build logo, website & marketing`,
        },
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?credits_added=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: {
      user_id: user.id,
      pack_id: pack.id,
      credits: String(pack.credits),
    },
  });

  return NextResponse.json({ url: session.url });
}
