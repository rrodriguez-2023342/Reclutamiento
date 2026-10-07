-- AlterTable
ALTER TABLE `postulantes` ADD COLUMN `conocimientos_tecnicos_especificar` VARCHAR(500) NULL,
    ADD COLUMN `equipo_maquinaria` TEXT NULL,
    ADD COLUMN `estudia_actualidad` BOOLEAN NULL,
    ADD COLUMN `estudia_establecimiento` VARCHAR(150) NULL,
    ADD COLUMN `estudia_fecha_fin` DATE NULL,
    ADD COLUMN `estudia_horario` VARCHAR(100) NULL,
    ADD COLUMN `estudia_que` VARCHAR(150) NULL,
    ADD COLUMN `posee_conocimientos_tecnicos` BOOLEAN NULL;
