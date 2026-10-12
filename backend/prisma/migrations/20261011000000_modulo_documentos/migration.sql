CREATE TABLE `tipos_documento_laboral` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `empresa_id` INTEGER NULL,
  `clave` VARCHAR(80) NOT NULL,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` TEXT NULL,
  `activo` BOOLEAN NOT NULL DEFAULT true,
  `creado_por_id` INTEGER NOT NULL,
  `creado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  INDEX `tipos_documento_laboral_empresa_id_activo_idx` (`empresa_id`, `activo`),
  PRIMARY KEY (`id`),
  CONSTRAINT `tipos_documento_laboral_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `tipos_documento_laboral_creado_por_id_fkey` FOREIGN KEY (`creado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `plantillas_documento` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `tipo_documento_id` INTEGER NOT NULL,
  `version` INTEGER NOT NULL,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `ruta_archivo` VARCHAR(500) NOT NULL,
  `tamano_bytes` INTEGER NOT NULL,
  `sha256` CHAR(64) NOT NULL,
  `notas_cambio` TEXT NULL,
  `marcadores` TEXT NOT NULL,
  `estado` ENUM('ACTIVA', 'INACTIVA', 'OBSOLETA') NOT NULL DEFAULT 'ACTIVA',
  `creada_por_id` INTEGER NOT NULL,
  `creada_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  UNIQUE INDEX `plantillas_documento_tipo_documento_id_version_key` (`tipo_documento_id`, `version`),
  INDEX `plantillas_documento_tipo_documento_id_estado_version_idx` (`tipo_documento_id`, `estado`, `version`),
  PRIMARY KEY (`id`),
  CONSTRAINT `plantillas_documento_tipo_documento_id_fkey` FOREIGN KEY (`tipo_documento_id`) REFERENCES `tipos_documento_laboral` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `plantillas_documento_creada_por_id_fkey` FOREIGN KEY (`creada_por_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `solicitudes_documento` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `tipo_documento_id` INTEGER NOT NULL,
  `colaborador_id` INTEGER NOT NULL,
  `empresa_id` INTEGER NOT NULL,
  `estado` ENUM('PENDIENTE', 'EN_PROCESO', 'GENERADO', 'RECHAZADA') NOT NULL DEFAULT 'PENDIENTE',
  `comentario` TEXT NULL,
  `motivo_rechazo` TEXT NULL,
  `solicitada_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  `atendida_por_id` INTEGER NULL,
  `atendida_en` TIMESTAMP(0) NULL,
  INDEX `solicitudes_documento_empresa_id_estado_solicitada_en_idx` (`empresa_id`, `estado`, `solicitada_en`),
  INDEX `solicitudes_documento_colaborador_id_solicitada_en_idx` (`colaborador_id`, `solicitada_en`),
  PRIMARY KEY (`id`),
  CONSTRAINT `solicitudes_documento_tipo_documento_id_fkey` FOREIGN KEY (`tipo_documento_id`) REFERENCES `tipos_documento_laboral` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `solicitudes_documento_colaborador_id_fkey` FOREIGN KEY (`colaborador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `solicitudes_documento_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `solicitudes_documento_atendida_por_id_fkey` FOREIGN KEY (`atendida_por_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `documentos_generados` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `solicitud_id` INTEGER NULL,
  `plantilla_id` INTEGER NOT NULL,
  `colaborador_id` INTEGER NOT NULL,
  `empresa_id` INTEGER NOT NULL,
  `generado_por_id` INTEGER NOT NULL,
  `nombre_archivo` VARCHAR(255) NOT NULL,
  `ruta_archivo` VARCHAR(500) NOT NULL,
  `tamano_bytes` INTEGER NOT NULL,
  `sha256` CHAR(64) NOT NULL,
  `generado_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  UNIQUE INDEX `documentos_generados_solicitud_id_key` (`solicitud_id`),
  INDEX `documentos_generados_empresa_id_generado_en_idx` (`empresa_id`, `generado_en`),
  INDEX `documentos_generados_colaborador_id_generado_en_idx` (`colaborador_id`, `generado_en`),
  PRIMARY KEY (`id`),
  CONSTRAINT `documentos_generados_solicitud_id_fkey` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_documento` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `documentos_generados_plantilla_id_fkey` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_documento` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `documentos_generados_colaborador_id_fkey` FOREIGN KEY (`colaborador_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `documentos_generados_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `documentos_generados_generado_por_id_fkey` FOREIGN KEY (`generado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notificaciones` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `usuario_id` INTEGER NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `titulo` VARCHAR(150) NOT NULL,
  `mensaje` VARCHAR(500) NOT NULL,
  `enlace` VARCHAR(255) NULL,
  `entidad_id` INTEGER NULL,
  `leida_en` TIMESTAMP(0) NULL,
  `creada_en` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
  INDEX `notificaciones_usuario_id_leida_en_creada_en_idx` (`usuario_id`, `leida_en`, `creada_en`),
  PRIMARY KEY (`id`),
  CONSTRAINT `notificaciones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
