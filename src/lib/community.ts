import { prisma } from "./prisma";
import { getCommunitySettings } from "./settings";

export type CommentStatus = "pending" | "approved" | "hidden";

export type CommentItem = {
  id: string;
  name: string;
  message: string;
  avatarColor: string;
  status: CommentStatus;
  source: string;
  createdAt: string;
};

export type PublicComment = {
  id: string;
  name: string;
  message: string;
  avatarColor: string;
  createdAt: string;
};

// Brand-ish avatar palette assigned to new visitor comments at random.
const AVATAR_COLORS = ["#10b981", "#14b8a6", "#84cc16", "#16a34a", "#0ea5e9", "#f59e0b"];

const NAME_MAX = 80;
const MSG_MAX = 1000;

function clean(v: string | undefined, max: number): string {
  return (v ?? "").trim().slice(0, max);
}

function toStatus(v: string): CommentStatus {
  return v === "approved" ? "approved" : v === "hidden" ? "hidden" : "pending";
}

function toItem(c: {
  id: string;
  name: string;
  message: string;
  avatarColor: string;
  status: string;
  source: string;
  createdAt: Date;
}): CommentItem {
  return {
    id: c.id,
    name: c.name,
    message: c.message,
    avatarColor: c.avatarColor,
    status: toStatus(c.status),
    source: c.source,
    createdAt: c.createdAt.toISOString(),
  };
}

/** Public submission. Pending unless auto-approve is enabled. */
export async function submitComment(input: {
  name: string;
  message: string;
}): Promise<{ ok: boolean; pending?: boolean; error?: "validation" }> {
  const name = clean(input.name, NAME_MAX);
  const message = clean(input.message, MSG_MAX);
  if (!name || message.length < 2) return { ok: false, error: "validation" };

  const { autoApprove } = await getCommunitySettings();
  await prisma.comment.create({
    data: {
      name,
      message,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      status: autoApprove ? "approved" : "pending",
      source: "community",
    },
  });
  return { ok: true, pending: !autoApprove };
}

/** Approved comments for the public wall. */
export async function listPublicComments(limit = 8): Promise<PublicComment[]> {
  const rows = await prisma.comment.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, limit),
  });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    message: c.message,
    avatarColor: c.avatarColor,
    createdAt: c.createdAt.toISOString(),
  }));
}

export type CommentFilter = "all" | "pending" | "approved" | "hidden";

export async function listAdminComments(filter: CommentFilter = "all"): Promise<CommentItem[]> {
  const where = filter === "all" ? {} : { status: filter };
  const rows = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return rows.map(toItem);
}

export async function getPendingCommentCount(): Promise<number> {
  return prisma.comment.count({ where: { status: "pending" } });
}

/** Admin-seeded comment (auto-approved, featured testimonial). */
export async function createSeedComment(input: {
  name: string;
  message: string;
}): Promise<{ ok: boolean; error?: "validation" }> {
  const name = clean(input.name, NAME_MAX);
  const message = clean(input.message, MSG_MAX);
  if (!name || message.length < 2) return { ok: false, error: "validation" };

  await prisma.comment.create({
    data: {
      name,
      message,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      status: "approved",
      source: "admin",
    },
  });
  return { ok: true };
}

export async function setCommentStatus(id: string, status: CommentStatus): Promise<void> {
  await prisma.comment.update({ where: { id }, data: { status } });
}

export async function deleteComment(id: string): Promise<void> {
  await prisma.comment.delete({ where: { id } });
}
