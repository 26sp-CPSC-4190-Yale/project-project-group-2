import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path: filePathParts } = await context.params;

    console.log("PARAMS:", filePathParts);

    const filePath = path.join(process.cwd(), "uploads", ...filePathParts);

    console.log("FULL PATH:", filePath);

    if (!fs.existsSync(filePath)) {
        console.log("FILE NOT FOUND");
        return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": "application/pdf",
        },
    });
}