/*
  Warnings:

  - You are about to drop the column `sybil_fid` on the `reports` table. All the data in the column will be lost.
  - Added the required column `target_fid` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "reports_sybil_fid_idx";

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "sybil_fid",
ADD COLUMN     "target_fid" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "reports_target_fid_idx" ON "reports"("target_fid");
