import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSimulationSchema = z.object({
  project_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSimulationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

  // Check user has credits
  const { data: profile } = await supabase
    .from("profiles").select("credits").eq("id", user.id).single();

  if (!profile || profile.credits <= 0) {
    return NextResponse.json(
      { error: "No credits remaining. Purchase a credit pack to continue.", code: "NO_CREDITS" },
      { status: 402 }
    );
  }

  // Verify project belongs to user
  const { data: project, error: projectError } = await supabase
    .from("projects").select("*").eq("id", parsed.data.project_id).eq("user_id", user.id).single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Spend credit
  const { data: spent } = await supabase.rpc("spend_credit", { user_uuid: user.id });
  if (!spent) {
    return NextResponse.json(
      { error: "No credits remaining. Purchase a credit pack to continue.", code: "NO_CREDITS" },
      { status: 402 }
    );
  }

  const { data: simulation, error } = await supabase
    .from("simulations")
    .insert({ project_id: project.id, user_id: user.id, status: "pending", total_rounds: 7 })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ simulation }, { status: 201 });
}
