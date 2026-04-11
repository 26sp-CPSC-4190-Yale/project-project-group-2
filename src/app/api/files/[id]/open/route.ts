import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const file = await prisma.uploadedFile.findFirst({
        where: {
            id,
            userId: session.userId,
        },
    });

    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin.storage
        .from("user-files")
        .createSignedUrl(file.storagePath, 60); // 60 seconds

    if (error || !data) {
        return NextResponse.json({ error: "Failed to generate URL" }, { status: 500 });
    }

    return NextResponse.json({
        url: data.signedUrl,
    });
}