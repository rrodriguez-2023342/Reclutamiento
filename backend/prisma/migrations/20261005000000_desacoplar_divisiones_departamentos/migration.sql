-- AlterTable
ALTER TABLE `postulantes` DROP COLUMN `puesto_solicita`,
    ADD COLUMN `contratado_por` INTEGER NULL,
    ADD COLUMN `fecha_contratacion` DATE NULL,
    ADD COLUMN `fecha_rechazo` DATE NULL,
    ADD COLUMN `motivo_rechazo` TEXT NULL,
    ADD COLUMN `plaza_id` INTEGER NULL,
    ADD COLUMN `rechazado_por` INTEGER NULL,
    MODIFY `estado` enum('Postulante','Reclutamiento','Contratado','Rechazado') NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `bonos` DECIMAL(10, 2) NULL,
    ADD COLUMN `direccion` TEXT NULL,
    ADD COLUMN `dpi` VARCHAR(20) NULL,
    ADD COLUMN `dpi_extendido_en` VARCHAR(100) NULL,
    ADD COLUMN `empresa_id` INTEGER NULL,
    ADD COLUMN `empresa_seguro_gastos_medicos` VARCHAR(100) NULL,
    ADD COLUMN `empresa_seguro_vida` VARCHAR(100) NULL,
    ADD COLUMN `fecha_nacimiento` DATE NULL,
    ADD COLUMN `must_change_password` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `patrono_id` INTEGER NULL,
    ADD COLUMN `puesto_id` INTEGER NULL,
    ADD COLUMN `reset_token` VARCHAR(255) NULL,
    ADD COLUMN `reset_token_expiry` TIMESTAMP(0) NULL,
    ADD COLUMN `sexo` ENUM('Masculino', 'Femenino') NULL,
    ADD COLUMN `sueldo` DECIMAL(10, 2) NULL,
    ADD COLUMN `tiene_seguro_gastos_medicos` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tiene_seguro_vida` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `departamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `divisiones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos_postulante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `tipo` ENUM('FOTO', 'ANTECEDENTES_PENALES', 'CARTA_RECOMENDACION', 'COPIA_DPI', 'TARJETA_SALUD', 'CURRICULUM') NOT NULL,
    `nombre_archivo` VARCHAR(255) NOT NULL,
    `ruta` VARCHAR(500) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `tamano_bytes` INTEGER NOT NULL,
    `fecha_subida` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `documentos_postulante_postulante_id_tipo_key`(`postulante_id` ASC, `tipo` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empresas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_empresa` VARCHAR(150) NOT NULL,
    `detalle_empresa` TEXT NULL,
    `direccion` TEXT NULL,
    `telefono` VARCHAR(20) NULL,
    `correo` VARCHAR(100) NULL,
    `fecha_aniversario` DATE NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `empresas_nombre_empresa_key`(`nombre_empresa` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `empresa_anterior_id` INTEGER NULL,
    `empresa_nuevo_id` INTEGER NULL,
    `motivo` TEXT NOT NULL,
    `cambiado_por_id` INTEGER NULL,
    `fecha_cambio` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `historial_empresa_cambiado_por_id_fkey`(`cambiado_por_id` ASC),
    INDEX `historial_empresa_empresa_anterior_id_fkey`(`empresa_anterior_id` ASC),
    INDEX `historial_empresa_empresa_nuevo_id_fkey`(`empresa_nuevo_id` ASC),
    INDEX `historial_empresa_usuario_id_fkey`(`usuario_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_rechazo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postulante_id` INTEGER NOT NULL,
    `motivo` TEXT NOT NULL,
    `rechazado_por` INTEGER NOT NULL,
    `fecha_rechazo` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `historial_rechazo_postulante_id_fkey`(`postulante_id` ASC),
    INDEX `historial_rechazo_rechazado_por_fkey`(`rechazado_por` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_sueldo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NOT NULL,
    `cambiado_por_id` INTEGER NULL,
    `sueldo_anterior` DECIMAL(10, 2) NULL,
    `sueldo_nuevo` DECIMAL(10, 2) NULL,
    `bonos_anterior` DECIMAL(10, 2) NULL,
    `bonos_nuevo` DECIMAL(10, 2) NULL,
    `motivo` TEXT NOT NULL,
    `fecha_cambio` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `historial_sueldo_cambiado_por_id_fkey`(`cambiado_por_id` ASC),
    INDEX `historial_sueldo_usuario_id_fkey`(`usuario_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patronos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `razon_social` VARCHAR(150) NOT NULL,
    `numero_patronal` VARCHAR(50) NULL,
    `nit` VARCHAR(20) NULL,
    `representante_legal` VARCHAR(150) NULL,
    `dpi_representante` VARCHAR(20) NULL,
    `fecha_vencimiento_dpi` DATE NULL,
    `fecha_nacimiento` DATE NULL,
    `sexo` ENUM('Masculino', 'Femenino') NULL,
    `estado_civil` ENUM('Soltero (a)', 'Casado (a)', 'Unido (a)', 'Viudo (a)', 'Divorciado (a)') NULL,
    `profesion` VARCHAR(100) NULL,
    `dpi_extendido_en` VARCHAR(100) NULL,
    `direccion` TEXT NULL,
    `telefono` VARCHAR(20) NULL,
    `correo` VARCHAR(100) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `patronos_razon_social_key`(`razon_social` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plazas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `tipo_moneda` ENUM('GTQ', 'USD') NOT NULL DEFAULT 'GTQ',
    `salario_min` DECIMAL(12, 2) NULL,
    `salario_max` DECIMAL(12, 2) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `plazas_nombre_key`(`nombre` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `puestos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `departamento_id` INTEGER NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `division_id` INTEGER NOT NULL,

    INDEX `puestos_departamento_id_fkey`(`departamento_id` ASC),
    INDEX `puestos_division_id_idx`(`division_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `postulantes_contratado_por_fkey` ON `postulantes`(`contratado_por` ASC);

-- CreateIndex
CREATE INDEX `postulantes_plaza_id_fkey` ON `postulantes`(`plaza_id` ASC);

-- CreateIndex
CREATE INDEX `postulantes_rechazado_por_fkey` ON `postulantes`(`rechazado_por` ASC);

-- CreateIndex
CREATE INDEX `usuarios_empresa_id_fkey` ON `usuarios`(`empresa_id` ASC);

-- CreateIndex
CREATE INDEX `usuarios_patrono_id_fkey` ON `usuarios`(`patrono_id` ASC);

-- CreateIndex
CREATE INDEX `usuarios_puesto_id_fkey` ON `usuarios`(`puesto_id` ASC);

-- CreateIndex
CREATE UNIQUE INDEX `usuarios_reset_token_key` ON `usuarios`(`reset_token` ASC);

-- AddForeignKey
ALTER TABLE `documentos_postulante` ADD CONSTRAINT `documentos_postulante_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_empresa` ADD CONSTRAINT `historial_empresa_cambiado_por_id_fkey` FOREIGN KEY (`cambiado_por_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_empresa` ADD CONSTRAINT `historial_empresa_empresa_anterior_id_fkey` FOREIGN KEY (`empresa_anterior_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_empresa` ADD CONSTRAINT `historial_empresa_empresa_nuevo_id_fkey` FOREIGN KEY (`empresa_nuevo_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_empresa` ADD CONSTRAINT `historial_empresa_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_rechazo` ADD CONSTRAINT `historial_rechazo_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_rechazo` ADD CONSTRAINT `historial_rechazo_rechazado_por_fkey` FOREIGN KEY (`rechazado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_sueldo` ADD CONSTRAINT `historial_sueldo_cambiado_por_id_fkey` FOREIGN KEY (`cambiado_por_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_sueldo` ADD CONSTRAINT `historial_sueldo_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulantes` ADD CONSTRAINT `postulantes_contratado_por_fkey` FOREIGN KEY (`contratado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulantes` ADD CONSTRAINT `postulantes_plaza_id_fkey` FOREIGN KEY (`plaza_id`) REFERENCES `plazas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postulantes` ADD CONSTRAINT `postulantes_rechazado_por_fkey` FOREIGN KEY (`rechazado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `puestos` ADD CONSTRAINT `puestos_departamento_id_fkey` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `puestos` ADD CONSTRAINT `puestos_division_id_fkey` FOREIGN KEY (`division_id`) REFERENCES `divisiones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_patrono_id_fkey` FOREIGN KEY (`patrono_id`) REFERENCES `patronos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_puesto_id_fkey` FOREIGN KEY (`puesto_id`) REFERENCES `puestos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
