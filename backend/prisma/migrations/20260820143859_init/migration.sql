-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `roles_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `rol_id` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postulantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `estado` ENUM('Pendiente', 'En Proceso', 'Contratado', 'Rechazado') NOT NULL,
    `fecha_registro` DATE NOT NULL,
    `nombre_completo` VARCHAR(150) NOT NULL,
    `direccion` TEXT NOT NULL,
    `lugar_nacimiento` VARCHAR(100) NOT NULL,
    `fecha_nacimiento` DATE NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `estado_civil` ENUM('Soltero (a)', 'Casado (a)', 'Unido (a)', 'Viudo (a)', 'Divorciado (a)') NOT NULL,
    `dpi` VARCHAR(20) NOT NULL,
    `dpi_extendido_en` VARCHAR(100) NULL,
    `nit` VARCHAR(20) NULL,
    `igss` VARCHAR(20) NULL,
    `perfil_facebook` VARCHAR(100) NULL,
    `afiliacion_gremial` BOOLEAN NULL,
    `afiliacion_religiosa` BOOLEAN NULL,
    `afiliacion_politica` BOOLEAN NULL,
    `afiliacion_deportiva` BOOLEAN NULL,
    `practica_deporte` BOOLEAN NULL,
    `deporte_cual` VARCHAR(100) NULL,
    `ha_estado_enfermo_gravedad` BOOLEAN NULL,
    `toma_medicamento` BOOLEAN NULL,
    `fuma_o_bebe` BOOLEAN NULL,
    `fuma_bebe_frecuencia` VARCHAR(100) NULL,
    `impedimento_fisico` BOOLEAN NULL,
    `personas_dependientes` INTEGER NULL,
    `fortaleza_1` VARCHAR(255) NULL,
    `fortaleza_2` VARCHAR(255) NULL,
    `fortaleza_3` VARCHAR(255) NULL,
    `debilidad_1` VARCHAR(255) NULL,
    `debilidad_2` VARCHAR(255) NULL,
    `debilidad_3` VARCHAR(255) NULL,
    `total_efectivo_hogar` DECIMAL(10, 2) NULL,
    `vivienda_tipo` ENUM('Propia', 'Alquilada', 'Familiar', 'Otra') NULL,
    `vivienda_valor` DECIMAL(10, 2) NULL,
    `vivienda_renta_monto` DECIMAL(10, 2) NULL,
    `tiene_vehiculo` BOOLEAN NULL,
    `licencia_tipo` VARCHAR(50) NULL,
    `licencia_numero` VARCHAR(50) NULL,
    `deudas_pendientes` BOOLEAN NULL,
    `deudas_monto` DECIMAL(10, 2) NULL,
    `deudas_institucion` VARCHAR(150) NULL,
    `detenido_policia` BOOLEAN NULL,
    `procesado_legalmente` BOOLEAN NULL,
    `puesto_solicita` VARCHAR(100) NOT NULL,
    `salario_aspira` DECIMAL(10, 2) NULL,
    `fecha_inicio_disponible` DATE NULL,
    `trabajar_extraordinario` BOOLEAN NULL,
    `trabajar_turnos_rotativos` BOOLEAN NULL,
    `medio_enterado` ENUM('Anuncio', 'Referencia', 'Otro') NULL,
    `porque_gustaria_trabajar` TEXT NULL,
    `porque_deberiamoss_contratar` TEXT NULL,

    UNIQUE INDEX `postulantes_dpi_key`(`dpi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulantes` ADD CONSTRAINT `postulantes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
