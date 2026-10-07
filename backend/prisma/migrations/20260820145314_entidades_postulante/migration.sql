/*
  Warnings:

  - You are about to alter the column `creado_en` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `usuarios` MODIFY `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE `datos_familiares` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `parentesco` ENUM('Padre', 'Madre', 'Esposo(a)', 'Hijo(a)', 'Hermano(a)', 'Emergencia') NOT NULL,
    `nombres_apellidos` VARCHAR(150) NOT NULL,
    `edad` INTEGER NULL,
    `direccion` TEXT NULL,
    `ocupacion` VARCHAR(100) NULL,
    `telefono` VARCHAR(20) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `educacion_historial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `nivel` ENUM('Primaria', 'Básicos', 'Diversificado', 'Técnico', 'Licenciatura', 'Maestría', 'Otro') NOT NULL,
    `establecimiento` VARCHAR(150) NULL,
    `ano_inicial` INTEGER NULL,
    `ano_final` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `idiomas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `idioma` VARCHAR(50) NOT NULL,
    `habla` BOOLEAN NULL,
    `lee` BOOLEAN NULL,
    `escribe` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `capacitaciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `nombre_curso` VARCHAR(150) NOT NULL,
    `establecimiento_pais` VARCHAR(150) NULL,
    `tiempo_duracion` VARCHAR(50) NULL,
    `fecha_inicial` DATE NULL,
    `fecha_final` DATE NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiencia_laboral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `empresa` VARCHAR(150) NOT NULL,
    `direccion` TEXT NULL,
    `telefono` VARCHAR(20) NULL,
    `puesto` VARCHAR(100) NOT NULL,
    `jefe_inmediato` VARCHAR(150) NULL,
    `fecha_ingreso` DATE NULL,
    `fecha_retiro` DATE NULL,
    `salario_inicial` DECIMAL(10, 2) NULL,
    `salario_final` DECIMAL(10, 2) NULL,
    `tareas_realizadas` TEXT NULL,
    `motivo_retiro` ENUM('Renuncia', 'Despido', 'Reorganización', 'Otro') NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referencias_personales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `direccion` TEXT NULL,
    `telefono` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `datos_familiares` ADD CONSTRAINT `datos_familiares_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `educacion_historial` ADD CONSTRAINT `educacion_historial_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `idiomas` ADD CONSTRAINT `idiomas_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `capacitaciones` ADD CONSTRAINT `capacitaciones_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experiencia_laboral` ADD CONSTRAINT `experiencia_laboral_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `referencias_personales` ADD CONSTRAINT `referencias_personales_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
