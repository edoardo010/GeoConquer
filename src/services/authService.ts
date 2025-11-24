import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { User } from '../types';
import { db } from '../models/database';

interface UserCredentials {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
}

export class AuthService {
  private users: Map<string, UserCredentials> = new Map();
  private sessions: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    const dbUsers = db.getUsers();
    dbUsers.forEach(user => {
      if (this.users.has(user.id)) return;
      
      const credentials: UserCredentials = {
        id: user.id,
        username: user.username,
        email: user.email,
        passwordHash: '',
        salt: ''
      };
      this.users.set(user.id, credentials);
    });
  }

  async registerUser(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const existing = db.getUserByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }

    const existingEmail = Array.from(this.users.values()).find(u => u.email === email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const userId = uuidv4();
    const salt = this.generateSalt();
    const passwordHash = this.hashPassword(password, salt);

    const user: User = {
      id: userId,
      username,
      email,
      totalDistance: 0,
      level: 1,
      experience: 0,
      badges: [],
      createdAt: new Date()
    };

    db.createUser(user);

    const credentials: UserCredentials = {
      id: userId,
      username,
      email,
      passwordHash,
      salt
    };

    this.users.set(userId, credentials);

    const token = this.generateToken(userId);
    return { user, token };
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const credentials = Array.from(this.users.values()).find(
      u => u.username === username
    );

    if (!credentials) {
      throw new Error('Invalid username or password');
    }

    const passwordHash = this.hashPassword(password, credentials.salt);
    if (passwordHash !== credentials.passwordHash) {
      throw new Error('Invalid username or password');
    }

    const user = db.getUser(credentials.id);
    if (!user) {
      throw new Error('User not found');
    }

    const token = this.generateToken(credentials.id);
    return { user, token };
  }

  verifyToken(token: string): string | null {
    const session = this.sessions.get(token);
    
    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }

    return session.userId;
  }

  logoutUser(token: string): void {
    this.sessions.delete(token);
  }

  private generateToken(userId: string): string {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    this.sessions.set(token, {
      userId,
      expiresAt
    });

    return token;
  }

  private hashPassword(password: string, salt: string): string {
    return crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
  }

  private generateSalt(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateUsername(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 20) {
      errors.push('Username must not exceed 20 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const authService = new AuthService();
