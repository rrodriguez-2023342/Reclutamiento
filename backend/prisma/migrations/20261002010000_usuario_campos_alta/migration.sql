ALTER TABLE `usuarios`
  ADD COLUMN `estado_civil` ENUM('Soltero (a)', 'Casado (a)', 'Unido (a)', 'Viudo (a)', 'Divorciado (a)') NULL,
  ADD COLUMN `nacionalidad` VARCHAR(100) NULL,
  ADD COLUMN `telefono` VARCHAR(20) NULL,
  ADD COLUMN `ultimo_grado_cursado` ENUM('Primaria', 'Básicos', 'Diversificado', 'Técnico', 'Licenciatura', 'Maestría', 'Otro') NULL,
  ADD COLUMN `moneda_sueldo` ENUM('GTQ', 'USD') NOT NULL DEFAULT 'GTQ',
  ADD COLUMN `banco` VARCHAR(100) NULL,
  ADD COLUMN `tipo_cuenta_bancaria` VARCHAR(50) NULL,
  ADD COLUMN `numero_cuenta_bancaria` VARCHAR(50) NULL,
  ADD COLUMN `contacto_emergencia_nombre` VARCHAR(150) NULL,
  ADD COLUMN `contacto_emergencia_telefono` VARCHAR(20) NULL;