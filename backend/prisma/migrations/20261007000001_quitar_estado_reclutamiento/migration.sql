-- El estado Reclutamiento deja de existir: el flujo pasa directo de Postulante a Contratado/Rechazado
UPDATE `postulantes` SET `estado` = 'Postulante' WHERE `estado` = 'Reclutamiento';

-- AlterTable
ALTER TABLE `postulantes` MODIFY `estado` enum('Postulante','Contratado','Rechazado') NOT NULL;
