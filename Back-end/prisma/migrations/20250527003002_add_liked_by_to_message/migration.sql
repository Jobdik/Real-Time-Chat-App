-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "likedBy" TEXT[] DEFAULT ARRAY[]::TEXT[];
