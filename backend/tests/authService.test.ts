import { describe, it, expect } from 'vitest'
import { authService } from '../src/services/authService'

describe('AuthService', () => {
  describe('register', () => {
    it('debería registrar un usuario correctamente', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('email', 'test@example.com')
      expect(result).toHaveProperty('name', 'Test User')
      expect(result).toHaveProperty('createdAt')
    })

    it('debería fallar con email inválido', async () => {
      expect(async () => {
        await authService.register({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        })
      }).rejects.toThrow()
    })

    it('debería fallar con contraseña corta', async () => {
      expect(async () => {
        await authService.register({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        })
      }).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('debería generar un token válido', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toHaveProperty('token')
      expect(result).toHaveProperty('user')
      expect(result.token).toBeTruthy()
    })
  })

  describe('verifyToken', () => {
    it('debería verificar un token válido', async () => {
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      const decoded = await authService.verifyToken(loginResult.token)
      expect(decoded).toHaveProperty('email')
    })

    it('debería fallar con token inválido', async () => {
      expect(async () => {
        await authService.verifyToken('invalid-token')
      }).rejects.toThrow()
    })
  })
})
