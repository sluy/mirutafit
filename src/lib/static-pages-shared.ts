/**
 * Client-safe types for the Static Pages module (no Prisma / node imports).
 * The DB functions live in `static-pages.ts` (server only).
 */
export type StaticPageListItem = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  updatedAt: string;
};

export type StaticPageEditData = {
  id: string;
  slug: string;
  title: string;
  html: string;
  published: boolean;
  respectMaintenance: boolean;
  notifyViews: boolean;
};
