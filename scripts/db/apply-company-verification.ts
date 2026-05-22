import prisma from "../../src/database/prisma"

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS company_verifications (
  id VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  companyName VARCHAR(191) NULL,
  taxCode VARCHAR(191) NULL,
  address VARCHAR(191) NULL,
  representative VARCHAR(191) NULL,
  phone VARCHAR(191) NULL,
  websiteOrFacebook VARCHAR(191) NULL,
  licenseFiles JSON NULL,
  status VARCHAR(191) NOT NULL DEFAULT 'UNVERIFIED',
  adminNote TEXT NULL,
  submittedAt DATETIME NULL,
  reviewedAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY company_verifications_userId_key (userId),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

const FK_NAME = "company_verifications_userId_fkey"

const FK_CHECK_SQL = `
SELECT COUNT(*) AS count
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'company_verifications'
  AND CONSTRAINT_NAME = '${FK_NAME}';
`

const ADD_FK_SQL = `
ALTER TABLE company_verifications
  ADD CONSTRAINT ${FK_NAME}
  FOREIGN KEY (userId) REFERENCES users(id)
  ON DELETE CASCADE ON UPDATE CASCADE;
`

async function main() {
    await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)

    const rows = (await prisma.$queryRawUnsafe(FK_CHECK_SQL)) as Array<{ count: number }>
    const count = rows?.[0]?.count ?? 0

    if (Number(count) === 0) {
        await prisma.$executeRawUnsafe(ADD_FK_SQL)
    }

    console.log("Company verification schema applied.")
}

main()
    .catch((error) => {
        console.error("Failed to apply company verification schema:", error)
        process.exitCode = 1
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
