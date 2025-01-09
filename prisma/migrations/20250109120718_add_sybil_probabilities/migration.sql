-- CreateTable
CREATE TABLE "sybil_probabilities" (
    "fid" BIGINT NOT NULL,
    "fname" TEXT NOT NULL,
    "sybil_probability" REAL,
    "sybil_diagnosis" BOOLEAN,

    CONSTRAINT "sybil_probabilities_pkey" PRIMARY KEY ("fid")
);
