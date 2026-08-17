import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Response.json({
    "NEXT_PUBLIC_SUPABASE_URL_exists": !!supabaseUrl,
    "NEXT_PUBLIC_SUPABASE_URL_value": supabaseUrl || "MISSING",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY_exists": !!anonKey,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY_length": anonKey?.length || 0,
    "SUPABASE_SERVICE_ROLE_KEY_exists": !!serviceRoleKey,
    "SUPABASE_SERVICE_ROLE_KEY_length": serviceRoleKey?.length || 0,
    "SUPABASE_SERVICE_ROLE_KEY_is_placeholder": serviceRoleKey === "your_service_role_key_here",
    "SUPABASE_SERVICE_ROLE_KEY_first_chars": serviceRoleKey?.substring(0, 10) || "MISSING",
    "_message": serviceRoleKey === "your_service_role_key_here" 
      ? "ERROR: SUPABASE_SERVICE_ROLE_KEY is still a placeholder! Replace 'your_service_role_key_here' with your real service role key from Supabase Dashboard."
      : "All keys appear to be configured",
  });
}
