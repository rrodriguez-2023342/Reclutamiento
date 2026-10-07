-- AlterTable
ALTER TABLE `postulantes` ADD COLUMN `afiliacion_civicos` BOOLEAN NULL,
    ADD COLUMN `afiliacion_civicos_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_deportiva_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_gremial_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_otros` BOOLEAN NULL,
    ADD COLUMN `afiliacion_otros_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_politica_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_religiosa_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_sindicales` BOOLEAN NULL,
    ADD COLUMN `afiliacion_sindicales_especificar` VARCHAR(255) NULL,
    ADD COLUMN `afiliacion_sociales` BOOLEAN NULL,
    ADD COLUMN `afiliacion_sociales_especificar` VARCHAR(255) NULL;
