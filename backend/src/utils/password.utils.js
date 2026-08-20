import argon2 from 'argon2'

// Encripta la contraseña con argon2id y devuelve el hash resultante
export const hashPassword = async (password) => {
  return argon2.hash(password, {
    type: argon2.argon2id, // Variante de argon2 recomendada
    memoryCost: 102400, // Memoria usada (más = más seguro y más lento)
    timeCost: 2, // Iteraciones
    parallelism: 8, // Hilos
    hashLength: 32, // Largo del hash
    saltLength: 16, // Largo del "sal" (valor aleatorio único por contraseña)
  })
}

// Compara la contraseña en texto plano con el hash almacenado
// Devuelve true si coinciden, false si no
export const verifyPassword = async (hashedPassword, plainPassword) => {
  try {
    return await argon2.verify(hashedPassword, plainPassword)
  } catch (error) {
    return false // Si el hash está mal formado, argon2 lanza un error.
  }
}