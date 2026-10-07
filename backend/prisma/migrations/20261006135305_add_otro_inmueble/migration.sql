-- AlterTable
ALTER TABLE `postulantes` ADD COLUMN `otro_inmueble_especificar` VARCHAR(255) NULL,
    ADD COLUMN `otro_inmueble_monto` DECIMAL(10, 2) NULL,
    ADD COLUMN `tiene_otro_inmueble` BOOLEAN NULL;
