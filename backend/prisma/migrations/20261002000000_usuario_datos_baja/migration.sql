ALTER TABLE `usuarios`
  ADD COLUMN `fecha_baja` DATE NULL,
  ADD COLUMN `motivo_baja` VARCHAR(100) NULL,
  ADD COLUMN `notas_baja` TEXT NULL;