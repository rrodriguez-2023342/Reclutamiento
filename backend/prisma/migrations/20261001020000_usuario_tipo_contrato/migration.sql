ALTER TABLE `usuarios`
  ADD COLUMN `tipo_contrato` VARCHAR(20) NOT NULL DEFAULT 'INDEFINIDO',
  ADD COLUMN `fecha_fin_contrato` DATE NULL;