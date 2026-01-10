import { Logger } from '../config/logger.js';
import bcrypt from 'bcryptjs';
import{eq} from 'drizzle-orm';
import {db} from '../database/db.js';
import {users} from '../models/user.model.js';


export const hashpassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
    // Simulate hashing operation
  }catch (error) {
    Logger.error('Error hashing password:', error);
    throw new Error('error hashing password');
  }
};

export const createUser = async ({name,email, password, role = 'user'}) => {
  try {
    // Simulate user creation operation
    const existingUser =db.select().from('users').where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }
    const hashedPassword = await hashpassword(password);
    const [newUser] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role,
    }).returning()({id: users.id, name: users.name, email: users.email, role: users.role});
    Logger.info('User created:', newUser);
    return newUser; 

  } catch (error) {
    Logger.error('Error creating user:', error);
    throw error;
  }
};