import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Register a new user
// Define your secret key for Urban Planner registration in the environment
const URBAN_PLANNER_SECRET = process.env.URBAN_PLANNER_SECRET;

export const registerUser = async (req, res, next) => {
  const { name, email, password, role, registrationSecret } = req.body;

  try {
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      return next(error);
    }

    
    if (role === 'Urban Planner') {
      if (registrationSecret !== URBAN_PLANNER_SECRET) {
        const error = new Error('Invalid registration secret for Urban Planner');
        error.statusCode = 403;
        return next(error);
      }
    }

    
    if (!['Urban Planner', 'Resident'].includes(role)) {
      const error = new Error('Invalid role');
      error.statusCode = 400;
      return next(error);
    }

    
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};



// User login
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 400;
      return next(error);
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    user = user.select('-password -salt');
    res.json(user);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};


// Update User Profile
export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;  // Explicitly set statusCode
      return next(error);  // Pass the error to the error handler
    }
    res.json(user);
  } catch (error) {
    error.statusCode = 500;
    next(error);  // Pass the error to the error handler
  }
};


// Change Password
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      return next(error);
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const token = user.generateResetToken();
    await user.save();

    res.json({ message: 'Password reset token generated', token });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
      
    });
    if (!user) {
      const error = new Error('Invalid or expired token');
      error.statusCode = 400;
      return next(error);
    }


    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

// Delete User Account
export const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json({ message: 'User account deleted' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};

// Update User Role (Admin Only)
export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    res.json(user);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};


