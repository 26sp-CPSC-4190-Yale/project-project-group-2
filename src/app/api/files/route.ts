import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jsonSuccess, jsonError } from "@/lib/api";

export async function GET(): Promise<NextResponse> {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const files = await prisma.uploadedFile.findMany({
        where: {
            userId: session.userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            calendar: { select: { id: true, title: true } },
        },
    });

    return jsonSuccess(files);
}
