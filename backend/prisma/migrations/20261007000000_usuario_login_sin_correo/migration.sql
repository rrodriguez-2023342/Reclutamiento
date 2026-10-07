-- AlterTable: el correo deja de ser obligatorio (colaboradores sin correo)
ALTER TABLE `usuarios` MODIFY COLUMN `correo` VARCHAR(100) NULL;

-- AlterTable: nombre de usuario para iniciar sesión sin correo
ALTER TABLE `usuarios` ADD COLUMN `usuario` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `usuarios_usuario_key` ON `usuarios`(`usuario`);
