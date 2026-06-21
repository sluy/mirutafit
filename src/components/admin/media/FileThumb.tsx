"use client";

import { mediaUrl, fileVersion, type MediaFileDTO } from "./types";
import { FileIcon } from "@/components/icons";

/* eslint-disable @next/next/no-img-element */

/**
 * Renders a file's visual: image thumbnail, a video that plays a muted preview
 * on hover, or a generic icon for other types.
 */
export function FileThumb({
  file,
  className = "",
}: {
  file: MediaFileDTO;
  className?: string;
}) {
  const isImg = file.mimeType.startsWith("image/");
  const isVid = file.mimeType.startsWith("video/");

  const v = fileVersion(file.updatedAt);

  if (isImg) {
    return (
      <img
        src={mediaUrl(file.fileName, { thumb: file.mimeType !== "image/svg+xml", v })}
        alt={file.name}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }

  if (isVid) {
    return (
      <video
        src={mediaUrl(file.fileName, { v })}
        muted
        loop
        playsInline
        preload="metadata"
        onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-ink/5 text-ink/30 ${className}`}>
      <FileIcon width={36} height={36} />
    </div>
  );
}
