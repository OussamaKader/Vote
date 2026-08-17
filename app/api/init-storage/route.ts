import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Route pour initialiser les buckets Supabase Storage
 * À appeler une fois pour créer les buckets nécessaires
 */
export async function POST() {
  try {
    const supabase = createAdminSupabaseClient();

    const bucketNames = ["logos", "candidate-photos"];
    const messages: string[] = [];

    const { data: buckets, error: listBucketsError } = await supabase.storage.listBuckets();

    if (listBucketsError) {
      throw new Error(`Impossible de lister les buckets Supabase: ${listBucketsError.message}`);
    }

    for (const bucketName of bucketNames) {
      const bucketExists = buckets?.some((bucket: { name: string }) => bucket.name === bucketName);

      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880,
        });

        if (createError && !createError.message.toLowerCase().includes("already exists")) {
          throw new Error(`Erreur création bucket ${bucketName}: ${createError.message}`);
        }

        messages.push(`✓ Bucket '${bucketName}' créé ou vérifié`);
      } else {
        messages.push(`✓ Bucket '${bucketName}' existe déjà`);
      }
    }

    return NextResponse.json(
      { message: messages.join(" | ") },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
