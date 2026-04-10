import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
        return NextResponse.json([]);
    }

    const files = fs.readdirSync(uploadDir);

    const formattedFiles = files.map((file, index) => {
        return {
            id: index,
            name: file.split("_").slice(1).join("_"),
            path: `/uploads/${file}`,
        };
    });

    return NextResponse.json(formattedFiles);
}