import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileViewerLoader } from "@/components/files/FileViewerLoader";

interface FilePageProps {
    params: Promise<{ id: string }>;
}

export default async function FilePage({ params }: FilePageProps) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { id } = await params;

    const file = await prisma.uploadedFile.findFirst({
        where: { id, userId: session.userId },
        include: { calendar: { select: { id: true, title: true } } },
    });

    if (!file) redirect("/files");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { avatarUrl: true },
    });

    return (
        <FileViewerLoader
            fileId={file.id}
            fileName={file.name}
            avatarUrl={user?.avatarUrl}
        />
    );
}
