-- CreateTable
CREATE TABLE `usuario_empresas` (
    `usuario_id` INTEGER NOT NULL,
    `empresa_id` INTEGER NOT NULL,

    PRIMARY KEY (`usuario_id`, `empresa_id`),
    INDEX `usuario_empresas_empresa_id_fkey`(`empresa_id`),
    CONSTRAINT `usuario_empresas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `usuario_empresas_empresa_id_fkey` FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
