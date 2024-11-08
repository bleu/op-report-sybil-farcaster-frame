-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "reporter_fid" BIGINT NOT NULL,
    "sybil_fid" BIGINT NOT NULL,
    "cast_hash" CHAR(42),
    "message_hash" CHAR(42),
    "network" INTEGER,
    "report_timestamp" TIMESTAMP(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_sybil_fid_idx" ON "reports"("sybil_fid");

-- CreateIndex
CREATE INDEX "reports_reporter_fid_idx" ON "reports"("reporter_fid");
