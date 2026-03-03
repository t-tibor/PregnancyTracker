-- CreateTable
CREATE TABLE "Measurement" (
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "circumference" DOUBLE PRECISION,
    "imagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("date")
);
