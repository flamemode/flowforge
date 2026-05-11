import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createSimulationSchema = z.object({
  project_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSimulationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  // Check simulation limit
  const { data: canRun } = await supabase.rpc("can_run_simulation", {
    user_uuid: user.id,
  });

  if (!canRun) {
    return NextResponse.json(
      {
        error: "Monthly simulation limit reached. Please upgrade your plan.",
        code: "LIMIT_REACHED",
      },
      { status: 429 }
    );
  }

  // Verify project belongs to user
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", parsed.data.project_id)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Create simulation record
  const { data: simulation, error } = await supabase
    .from("simulations")
    .insert({
      project_id: project.id,
      user_id: user.id,
      status: "pending",
      total_rounds: 7,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment usage counter
  await supabase.rpc("increment_simulation_count", { user_uuid: user.id });

  return NextResponse.json({ simulation }, { status: 201 });
}
