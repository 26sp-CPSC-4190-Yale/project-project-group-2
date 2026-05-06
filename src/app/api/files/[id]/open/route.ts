import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { id } = await context.params;

    const file = await prisma.uploadedFile.findFirst({
        where: {
            id,
            userId: session.userId,
        },
    });

    if (!file) return jsonError("File not found", 404);

    const { data, error } = await supabaseAdmin.storage
        .from("user-files")
        .createSignedUrl(file.storagePath, 60);

    if (error || !data) return jsonError("Failed to generate URL", 500);

    return jsonSuccess({ url: data.signedUrl });
}
