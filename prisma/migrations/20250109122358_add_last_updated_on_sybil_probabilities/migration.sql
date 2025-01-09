-- AlterTable
ALTER TABLE "sybil_probabilities" ADD COLUMN     "last_updated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
