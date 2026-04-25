import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function POST(req: Request): Promise<NextResponse> {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return jsonError("No file uploaded", 400);
    if (file.type !== "application/pdf") return jsonError("Only PDFs allowed", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "_");
    const storagePath = `${session.userId}/${Date.now()}_${safeName}`;

    const { error } = await supabaseAdmin.storage
        .from("user-files")
        .upload(storagePath, buffer, {
            contentType: file.type,
        });

    if (error) return jsonError(error.message, 500);

    const calendarId = (formData.get("calendarId") as string | null) || null;

    if (calendarId) {
        const cal = await prisma.calendar.findFirst({
            where: { id: calendarId, userId: session.userId },
            select: { id: true },
        });
        if (!cal) return jsonError("Invalid calendarId", 400);
    }

    const savedFile = await prisma.uploadedFile.create({
        data: {
            name: file.name,
            storagePath,
            userId: session.userId,
            calendarId,
        },
        include: {
            calendar: { select: { id: true, title: true } },
        },
    });

    return jsonSuccess(savedFile);
}
