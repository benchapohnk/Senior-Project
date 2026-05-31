-- AlterTable
ALTER TABLE `order` ADD COLUMN `trackingNumber` VARCHAR(191) NULL,
    MODIFY `orderStatus` VARCHAR(191) NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE `product` ADD COLUMN `farmerId` INTEGER NULL,
    ADD COLUMN `harvestDate` DATETIME(3) NULL,
    ADD COLUMN `organic` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `origin` VARCHAR(191) NULL,
    ADD COLUMN `unit` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `FarmerProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FarmerProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FarmerProfile` ADD CONSTRAINT `FarmerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_farmerId_fkey` FOREIGN KEY (`farmerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
