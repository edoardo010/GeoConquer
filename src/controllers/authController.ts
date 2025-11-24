import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

const authService = new AuthService();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['username', 'email', 'password', 'confirmPassword']
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const usernameValidation = authService.validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({
        error: 'Invalid username',
        details: usernameValidation.errors
      });
    }

    const emailValidation = authService.validateEmail(email);
    if (!emailValidation) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordValidation = authService.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        requirements: passwordValidation.errors
      });
    }

    const { user, token } = await authService.registerUser(username, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level,
        createdAt: user.createdAt
      },
      token,
      redirectTo: '/'
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('already registered')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { user, token } = await authService.loginUser(username, password);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        level: user.level
      },
      token,
      redirectTo: '/'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    authService.logoutUser(token);

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const userId = authService.verifyToken(token);

    if (!userId) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    res.json({
      valid: true,
      userId,
      message: 'Token is valid'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPasswordRequirements = (req: Request, res: Response) => {
  res.json({
    password_requirements: [
      'Minimum 8 characters',
      'At least one uppercase letter (A-Z)',
      'At least one lowercase letter (a-z)',
      'At least one number (0-9)',
      'At least one special character (!@#$%^&*)'
    ]
  });
};

export const getUsernameRequirements = (req: Request, res: Response) => {
  res.json({
    username_requirements: [
      'Minimum 3 characters',
      'Maximum 20 characters',
      'Can only contain letters, numbers, underscores, and hyphens'
    ]
  });
};
