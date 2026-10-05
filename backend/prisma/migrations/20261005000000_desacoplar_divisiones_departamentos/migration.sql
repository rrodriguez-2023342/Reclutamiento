ALTER TABLE `puestos`
  ADD COLUMN `division_id` INTEGER NULL;

UPDATE `puestos` AS p
INNER JOIN `departamentos` AS d ON d.`id` = p.`departamento_id`
SET p.`division_id` = d.`division_id`;

ALTER TABLE `puestos`
  MODIFY COLUMN `division_id` INTEGER NOT NULL,
  ADD INDEX `puestos_division_id_idx` (`division_id`),
  ADD CONSTRAINT `puestos_division_id_fkey`
    FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `divisiones`
  DROP FOREIGN KEY `divisiones_empresa_id_fkey`,
  DROP COLUMN `empresa_id`;

ALTER TABLE `departamentos`
  DROP FOREIGN KEY `departamentos_division_id_fkey`,
  DROP COLUMN `division_id`;