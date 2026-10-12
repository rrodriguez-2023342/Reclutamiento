ALTER TABLE `plantillas_documento`
  ADD COLUMN `eliminada_en` TIMESTAMP(0) NULL,
  ADD COLUMN `eliminada_por_id` INTEGER NULL,
  ADD INDEX `plantillas_documento_eliminada_en_idx` (`eliminada_en`),
  ADD CONSTRAINT `plantillas_documento_eliminada_por_id_fkey`
    FOREIGN KEY (`eliminada_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `documentos_generados`
  ADD COLUMN `eliminado_en` TIMESTAMP(0) NULL,
  ADD COLUMN `eliminado_por_id` INTEGER NULL,
  ADD INDEX `documentos_generados_eliminado_en_idx` (`eliminado_en`),
  ADD CONSTRAINT `documentos_generados_eliminado_por_id_fkey`
    FOREIGN KEY (`eliminado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
