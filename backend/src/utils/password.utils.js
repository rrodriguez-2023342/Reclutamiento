import argon2 from 'argon2'

export const hashPassword = async (password) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 102400,
    timeCost: 2,
    parallelism: 8,
    hashLength: 32,
    saltLength: 16,
  })
}