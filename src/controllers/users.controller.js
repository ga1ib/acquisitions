import logger from '../config/logger.js';
import { formatValidationErrors } from '../utils/format.js';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '../services/users.services.js';
import {
  updateUserSchema,
  userIdSchema,
} from '../validations/users.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    res.json({
      message: 'Users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Error in fetchAllUsers controller:', error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        errors: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('User fetched successfully', { id });
    res.status(200).json({
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    logger.error('Error in getUserById controller:', error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        errors: 'Validation failed',
        details: formatValidationErrors(idValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        errors: 'Validation failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole !== 'admin' && requesterId !== id) {
      return res
        .status(403)
        .json({ message: 'You can only update your own account' });
    }

    if (typeof updates.role !== 'undefined' && requesterRole !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Only admin users can change roles' });
    }

    const sanitizedUpdates = { ...updates };
    if (requesterRole !== 'admin') {
      delete sanitizedUpdates.role;
    }

    try {
      const updatedUser = await updateUserService(id, sanitizedUpdates);
      logger.info('User updated successfully', { id, by: requesterId });
      return res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error in updateUser controller:', error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        errors: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    if (requesterRole !== 'admin' && requesterId !== id) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own account' });
    }

    try {
      await deleteUserService(id);
      logger.info('User deleted successfully', { id, by: requesterId });
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: 'User not found' });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error in deleteUser controller:', error);
    next(error);
  }
};
