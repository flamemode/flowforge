import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  questionnaire: z.object({
    platform: z.enum(["web", "mobile"]).default("web"),
    project_type: z.string().optional(),
    framework: z.string().optional(),
    language: z.string().optional(),
    styling: z.string().optional(),
    database: z.string().optional(),
    cms: z.string().optional(),
    auth: z.string().optional(),
    payments: z.string().optional(),
    extra_apis: z.array(z.string()).optional(),
    design_style: z.string().optional(),
    color_scheme: z.string().optional(),
    animations: z.string().optional(),
    features: z.array(z.string()).optional(),
    description: z.string().min(1),
    project_name: z.string().min(1),
    mobile_app_type: z.string().optional(),
    mobile_framework: z.string().optional(),
    mobile_backend: z.string().optional(),
    mobile_features: z.array(z.string()).optional(),
    dev_os: z.enum(["macos_modern", "macos_catalina", "windows", "linux"]).optional(),
    node_version: z.enum(["18", "20", "22"]).optional(),
  }),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("generated_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ projects: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Check and spend credit
  const { data: profile } = await supabase
    .from("profiles").select("credits").eq("id", user.id).single();

  if (!profile || profile.credits <= 0) {
    return NextResponse.json(
      { error: "No credits remaining. Purchase a pack to continue.", code: "NO_CREDITS" },
      { status: 402 }
    );
  }

  const { data: spent } = await supabase.rpc("spend_credit", { user_uuid: user.id });
  if (!spent) {
    return NextResponse.json(
      { error: "No credits remaining.", code: "NO_CREDITS" },
      { status: 402 }
    );
  }

  const { data, error } = await supabase
    .from("generated_projects")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      questionnaire: parsed.data.questionnaire,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ project: data }, { status: 201 });
}
