import logger from '../config/logger.js';
import { signupSchema, signinSchema } from '../validations/auth.validation.js';
import { formatValidationErrors } from '../utils/format.js';
import { createUser, authenticateUser } from '../services/auth.service.js';
import { jwttoken } from '../utils/jwt.js';
import { cookies } from '../utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        errors: 'Validation failed',
        details: formatValidationErrors(validationResult.error)
      });
    }
    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User registration successful for email: ${email}`);
    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Error in signup controller:', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: 'User already exists' });
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        errors: 'Validation failed',
        details: formatValidationErrors(validationResult.error)
      });
    }
    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token', token);

    logger.info(`User login successful for email: ${email}`);
    res.status(200).json({ 
      message: 'User logged in successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    logger.error('Error in signin controller:', error);
    if (error.message === 'User not found' || error.message === 'Invalid password') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');
    
    logger.info('User logged out successfully');
    res.status(200).json({ 
      message: 'User logged out successfully'
    });
  } catch (error) {
    logger.error('Error in signout controller:', error);
    next(error);
  }
};
