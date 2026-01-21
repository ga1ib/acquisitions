import logger from '../config/logger.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { Users } from '../models/user.model.js';


export const hashpassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Error comparing password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db.select().from(Users).where(eq(Users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hashpassword(password);
    const [newUser] = await db.insert(Users).values({
      name,
      email,
      password: hashedPassword,
      role,
    }).returning({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      role: Users.role
    });
    logger.info('User created:', newUser);
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [user] = await db.select().from(Users).where(eq(Users.email, email)).limit(1);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const [authenticatedUser] = await db
      .select({
        id: Users.id,
        name: Users.name,
        email: Users.email,
        role: Users.role,
        createdAt: Users.createdAt,
        updatedAt: Users.updatedAt,
      })
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);

    logger.info(`User authenticated successfully for email: ${email}`);
    return authenticatedUser;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    throw error;
  }
};
