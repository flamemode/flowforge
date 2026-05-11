import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  client_type: z.string().min(1),
  project_type: z.enum([
    "brand_identity",
    "website_design",
    "web_development",
    "ui_ux_design",
    "digital_marketing",
    "content_strategy",
    "full_service",
  ]),
  budget: z.number().positive(),
  timeline_weeks: z.number().int().min(1).max(104),
  team_size: z.number().int().min(1).max(50),
  client_personality: z.enum([
    "collaborative",
    "indecisive_founder",
    "micromanager_cmo",
    "visionary_vague",
    "budget_hawk",
    "scope_creeper",
  ]),
  scope_description: z.string().min(10),
  special_requirements: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*, simulations(id, status, success_probability, created_at)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

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

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
