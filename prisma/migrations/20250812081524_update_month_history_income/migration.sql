/*
  Warnings:

  - You are about to drop the column `icome` on the `MonthHistory` table. All the data in the column will be lost.
  - Added the required column `income` to the `MonthHistory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthHistory" (
    "userId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "income" REAL NOT NULL,
    "expense" REAL NOT NULL,

    PRIMARY KEY ("day", "month", "year", "userId")
);
INSERT INTO "new_MonthHistory" ("day", "expense", "month", "userId", "year") SELECT "day", "expense", "month", "userId", "year" FROM "MonthHistory";
DROP TABLE "MonthHistory";
ALTER TABLE "new_MonthHistory" RENAME TO "MonthHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
