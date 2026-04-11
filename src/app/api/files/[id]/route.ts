import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const file = await prisma.uploadedFile.findFirst({
        where: { id, userId: session.userId },
    });

    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    let body: { name?: string; calendarId?: string | null };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data: { name?: string; calendarId?: string | null } = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.calendarId !== undefined) data.calendarId = body.calendarId;

    const updated = await prisma.uploadedFile.update({
        where: { id },
        data,
        include: { calendar: { select: { id: true, title: true } } },
    });

    return NextResponse.json(updated);
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const file = await prisma.uploadedFile.findFirst({
        where: { id, userId: session.userId },
    });

    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await supabaseAdmin.storage
        .from("user-files")
        .remove([file.storagePath]);

    await prisma.uploadedFile.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
