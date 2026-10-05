-- AlterTable
ALTER TABLE `educacion_historial` ADD COLUMN `estado` ENUM('Completa', 'Incompleta') NOT NULL DEFAULT 'Completa';
