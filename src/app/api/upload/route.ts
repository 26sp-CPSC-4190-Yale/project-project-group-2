import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDFs allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/\s+/g, "_");
    const storagePath = `${session.userId}/${Date.now()}_${safeName}`;

    const { error } = await supabaseAdmin.storage
        .from("user-files")
        .upload(storagePath, buffer, {
            contentType: file.type,
        });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const calendarId = formData.get("calendarId") as string | null;

    const savedFile = await prisma.uploadedFile.create({
        data: {
            name: file.name,
            storagePath,
            userId: session.userId,
            calendarId: calendarId || null,
        },
        include: {
            calendar: { select: { id: true, title: true } },
        },
    });

    return NextResponse.json(savedFile);
}