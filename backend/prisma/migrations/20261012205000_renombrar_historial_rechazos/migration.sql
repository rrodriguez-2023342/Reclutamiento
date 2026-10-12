-- Rename historial_rechazo to historial_rechazos
-- DropForeignKey
ALTER TABLE `historial_rechazo` DROP FOREIGN KEY `historial_rechazo_postulante_id_fkey`;

-- DropForeignKey
ALTER TABLE `historial_rechazo` DROP FOREIGN KEY `historial_rechazo_rechazado_por_fkey`;

-- Rename table
RENAME TABLE `historial_rechazo` TO `historial_rechazos`;

-- AddForeignKey
ALTER TABLE `historial_rechazos` ADD CONSTRAINT `historial_rechazos_postulante_id_fkey` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_rechazos` ADD CONSTRAINT `historial_rechazos_rechazado_por_fkey` FOREIGN KEY (`rechazado_por`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;