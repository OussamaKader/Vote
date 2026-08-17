import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      return Response.json(
        {
          connected: false,
          message: "Connexion Supabase échouée",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      connected: true,
      message: "Connexion Supabase réussie",
      data: data,
    });
  } catch (err) {
    return Response.json(
      {
        connected: false,
        message: "Connexion Supabase échouée",
        error: err instanceof Error ? err.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
