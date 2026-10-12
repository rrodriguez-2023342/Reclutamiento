-- AlterTable
ALTER TABLE `patronos` ADD COLUMN `autorizada_por_notario` VARCHAR(150) NULL,
    ADD COLUMN `direccion_patente_comercio` TEXT NULL,
    ADD COLUMN `fecha_autorizacion_acta` DATE NULL,
    ADD COLUMN `numero_folio` VARCHAR(50) NULL,
    ADD COLUMN `numero_libro` VARCHAR(50) NULL,
    ADD COLUMN `numero_registro` VARCHAR(50) NULL;
