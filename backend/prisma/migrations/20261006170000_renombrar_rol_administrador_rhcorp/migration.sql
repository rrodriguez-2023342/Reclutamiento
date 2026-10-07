-- Renombra el rol "Administrador" a "Administrador RHCorp".
-- Maneja el caso en que el seed ya haya creado el rol nuevo (p.ej. por un
-- reinicio del servidor tras actualizar la constante): primero reasigna los
-- usuarios del rol viejo al nuevo y luego elimina la fila vieja, conservando
-- siempre el id cuando solo existe el rol original.

-- 1) Pasar usuarios del rol viejo al rol nuevo (si el nuevo ya existe)
UPDATE `usuarios` AS u
INNER JOIN `roles` AS ro ON ro.`id` = u.`rol_id` AND ro.`nombre` = 'Administrador'
INNER JOIN `roles` AS rn ON rn.`nombre` = 'Administrador RHCorp'
SET u.`rol_id` = rn.`id`;

-- 2) Renombrar el rol viejo si el nuevo aun no existe
UPDATE `roles`
SET `nombre` = 'Administrador RHCorp'
WHERE `nombre` = 'Administrador'
  AND NOT EXISTS (
    SELECT 1
    FROM (SELECT `nombre` FROM `roles`) AS r
    WHERE r.`nombre` = 'Administrador RHCorp'
  );

-- 3) Eliminar el rol viejo si quedo duplicado (ya sin usuarios)
DELETE FROM `roles`
WHERE `nombre` = 'Administrador'
  AND EXISTS (
    SELECT 1
    FROM (SELECT `nombre` FROM `roles`) AS r
    WHERE r.`nombre` = 'Administrador RHCorp'
  );
