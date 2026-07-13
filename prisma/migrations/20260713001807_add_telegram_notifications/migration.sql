-- AlterTable
ALTER TABLE "static_page" ADD COLUMN     "notifyViews" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "survey" ADD COLUMN     "notifyResponses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifyViews" BOOLEAN NOT NULL DEFAULT false;
