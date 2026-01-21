import { db } from '../config/database.js';
import logger from '../config/logger.js';
import users from '../models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  } catch (error) {
    logger.error(`Error fetching user by id ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    const allowedUpdates = {};
    if (typeof updates.name !== 'undefined') allowedUpdates.name = updates.name;
    if (typeof updates.email !== 'undefined') allowedUpdates.email = updates.email;
    if (typeof updates.role !== 'undefined') allowedUpdates.role = updates.role;

    if (Object.keys(allowedUpdates).length === 0) {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return user || null;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...allowedUpdates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    logger.info('User updated:', { id, updates: allowedUpdates });
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
    logger.info('User deleted:', { id });
  } catch (error) {
    logger.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};
