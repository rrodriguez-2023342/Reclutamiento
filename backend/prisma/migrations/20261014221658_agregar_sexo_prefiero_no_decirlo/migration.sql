-- AlterTable
ALTER TABLE `patronos` MODIFY `sexo` ENUM('Masculino', 'Femenino', 'Prefiero_no_decirlo') NULL;

-- AlterTable
ALTER TABLE `postulantes` MODIFY `sexo` ENUM('Masculino', 'Femenino', 'Prefiero_no_decirlo') NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `sexo` ENUM('Masculino', 'Femenino', 'Prefiero_no_decirlo') NULL;
