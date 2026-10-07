-- Auditoría de devoluciones de contratación a estado Postulante
ALTER TABLE `postulantes`
    ADD COLUMN `motivo_devolucion` TEXT NULL,
    ADD COLUMN `fecha_devolucion` DATE NULL,
    ADD COLUMN `devuelto_por` INTEGER NULL;

-- CreateIndex
CREATE INDEX `postulantes_devuelto_por_fkey` ON `postulantes`(`devuelto_por` ASC);

-- AddForeignKey
ALTER TABLE `postulantes` ADD CONSTRAINT `postulantes_devuelto_por_fkey` FOREIGN KEY (`devuelto_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
