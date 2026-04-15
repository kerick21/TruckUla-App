import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
})

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'secret'
  private jwtExpiry = process.env.JWT_EXPIRY || '7d'

  async register(data: unknown) {
    const validated = RegisterSchema.parse(data)
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)
    
    // En producción, guardar en BD
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: validated.email,
      name: validated.name,
      createdAt: new Date(),
    }
  }

  async login(data: unknown) {
    const validated = LoginSchema.parse(data)
    
    // En producción, buscar en BD
    const user = {
      id: '1',
      email: validated.email,
      name: 'Usuario',
    }
    
    const token = jwt.sign(user, this.jwtSecret, { expiresIn: this.jwtExpiry })
    
    return {
      token,
      user,
    }
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret)
      return decoded
    } catch (error) {
      throw new Error('Token inválido')
    }
  }

  async refreshToken(token: string) {
    const decoded = this.verifyToken(token)
    const newToken = jwt.sign(decoded, this.jwtSecret, { expiresIn: this.jwtExpiry })
    return { token: newToken }
  }
}

export const authService = new AuthService()
