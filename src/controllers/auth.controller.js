
import logger from '../logger/logger.js';
import { signupSchema } from '../validators/auth.validator.js';
import { formatValidationErrors } from '../utils/validation.js';import { createUser } from '../services/auth.service.js';
import jwttoken from 'jsonwebtoken';
import cookies from '../utils/cookies.js';

export const signup =async (req, res, next) => {
  try {

    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: 'Validation failed' ,
        details: formatValidationErrors(validationResult.error)});
    }
    const { name, email, password, role } = validationResult.data;

    const user= await createUser({name, email, password, role});

    const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
    cookies.set(res, 'token',token);

    logger.info(`User registration successful for email: ${email}`);
    res.status(201).json({ message: 'User registered successfully' ,
      user: { id: user.id, name: user.name, email: user.email, role: user.role}
    });


  } catch (error) {
    logger.error('Error in signup controller:', error);
    if(error.message === 'user already exists'){
      return res.status(409).json({ message: 'User already exists' });
    }
    next(error);
  }
};