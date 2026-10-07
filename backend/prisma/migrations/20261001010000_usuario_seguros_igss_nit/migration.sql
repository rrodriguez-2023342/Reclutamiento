ALTER TABLE `usuarios`
  ADD COLUMN `nit` VARCHAR(20) NULL,
  ADD COLUMN `numero_afiliacion_igss` VARCHAR(30) NULL,
  ADD COLUMN `tipo_seguro_gastos_medicos` VARCHAR(20) NULL,
  ADD COLUMN `categoria_seguro_gastos_medicos` VARCHAR(100) NULL,
  ADD COLUMN `categoria_seguro_vida` VARCHAR(100) NULL;