-- AlterTable
ALTER TABLE `postulantes` ADD COLUMN `medio_enterado_especificar` VARCHAR(255) NULL,
    ADD COLUMN `parientes_empresa_nombre` VARCHAR(255) NULL,
    ADD COLUMN `sexo` ENUM('Masculino', 'Femenino') NULL,
    ADD COLUMN `tiene_parientes_empresa` BOOLEAN NULL;
