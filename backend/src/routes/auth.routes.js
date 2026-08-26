import { Router } from 'express'
import {
  login,
  me,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyCurrentPassword,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { strictAuthRateLimit, authRateLimit } from '../middlewares/rate-limit.js'

const router = Router()

// Rutas públicas con rate limit estricto
router.post('/login', strictAuthRateLimit, login)
router.post('/forgot-password', strictAuthRateLimit, forgotPassword)
router.post('/reset-password', strictAuthRateLimit, resetPassword)

// Rutas protegidas
router.post('/logout', authRateLimit, authenticate, logout)
router.get('/me', authenticate, me)
router.put('/change-password', authRateLimit, authenticate, changePassword)
router.post('/verify-password', authRateLimit, authenticate, verifyCurrentPassword)

export default router