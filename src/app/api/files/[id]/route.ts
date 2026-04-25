import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { id } = await context.params;

    const file = await prisma.uploadedFile.findFirst({
        where: { id, userId: session.userId },
    });

    if (!file) return jsonError("File not found", 404);

    let body: { name?: string; calendarId?: string | null };
    try {
        body = await req.json();
    } catch {
        return jsonError("Invalid JSON body", 400);
    }

    if (body.calendarId) {
        const cal = await prisma.calendar.findFirst({
            where: { id: body.calendarId, userId: session.userId },
            select: { id: true },
        });
        if (!cal) return jsonError("Invalid calendarId", 400);
    }

    const data: { name?: string; calendarId?: string | null } = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.calendarId !== undefined) data.calendarId = body.calendarId;

    const updated = await prisma.uploadedFile.update({
        where: { id },
        data,
        include: { calendar: { select: { id: true, title: true } } },
    });

    return jsonSuccess(updated);
}

export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { id } = await context.params;

    const file = await prisma.uploadedFile.findFirst({
        where: { id, userId: session.userId },
    });

    if (!file) return jsonError("File not found", 404);

    await supabaseAdmin.storage
        .from("user-files")
        .remove([file.storagePath]);

    await prisma.uploadedFile.delete({ where: { id } });

    return jsonSuccess({ message: "File deleted" });
}
