/*
  Warnings:

  - Added the required column `sybil_probability` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "sybil_probability" REAL NOT NULL;
