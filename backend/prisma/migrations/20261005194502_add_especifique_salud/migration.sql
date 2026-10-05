-- AlterTable
ALTER TABLE `postulantes` ADD COLUMN `ha_estado_enfermo_gravedad_especificar` VARCHAR(255) NULL,
    ADD COLUMN `impedimento_fisico_especificar` VARCHAR(255) NULL,
    ADD COLUMN `toma_medicamento_especificar` VARCHAR(255) NULL;
