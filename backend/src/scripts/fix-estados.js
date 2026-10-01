import prisma from '../config/prisma.js'

async function main() {
  const result1 = await prisma.$executeRaw`UPDATE postulantes SET estado = 'Postulante' WHERE estado = 'Pendiente'`
  console.log('Actualizados Pendiente -> Postulante:', result1)

  const result2 = await prisma.$executeRaw`UPDATE postulantes SET estado = 'Reclutamiento' WHERE estado = 'En Proceso'`
  console.log('Actualizados En Proceso -> Reclutamiento:', result2)

  const postulantes = await prisma.postulante.findMany({
    select: { id: true, estado: true, nombre_completo: true }
  })
  console.log('\nEstados actuales:')
  postulantes.forEach(p => console.log(`  ${p.id}: ${p.estado} - ${p.nombre_completo}`))
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect())