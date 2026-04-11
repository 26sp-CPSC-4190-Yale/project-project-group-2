"use client";

import dynamic from "next/dynamic";

const FileViewer = dynamic(
    () => import("./FileViewer").then((mod) => mod.FileViewer),
    { ssr: false }
);

interface FileViewerLoaderProps {
    fileId: string;
    fileName: string;
    avatarUrl?: string | null;
}

export function FileViewerLoader(props: FileViewerLoaderProps) {
    return <FileViewer {...props} />;
}
