import User from '../models/User.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import validator from 'validator';

dotenv.config();

// Register a new user
const URBAN_PLANNER_SECRET = process.env.URBAN_PLANNER_SECRET;
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res, next) => {
  const { name, email, password, role, registrationSecret } = req.body;

  try {
    // Validate inputs
    if (!name || !email || !password || !role) {
      const error = new Error('All fields are required');
      error.statusCode = 400;
      return next(error);
    }

    // Validate and sanitize email
    if (typeof email !== 'string' || !email.trim()) {
      const error = new Error('Email must be a valid non-empty string');
      error.statusCode = 400;
      return next(error);
    }

    const sanitizedEmail = validator.normalizeEmail(email.trim().toLowerCase());
    if (!sanitizedEmail || !validator.isEmail(sanitizedEmail)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      return next(error);
    }

    // Explicitly validate sanitizedEmail to prevent injection
    if (/[$]/.test(sanitizedEmail)) {
      const error = new Error('Invalid email characters');
      error.statusCode = 400;
      return next(error);
    }

    // Check for duplicate email using strict MongoDB operator
    const existingUser = await User.findOne({
      email: { $eq: sanitizedEmail }, // Use $eq for explicit matching
    }).lean();

    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      return next(error);
    }

    // Validate role and secret key
    if (role === 'Urban Planner') {
      if (registrationSecret !== URBAN_PLANNER_SECRET) {
        const error = new Error('Unauthorized to register as Urban Planner');
        error.statusCode = 403;
        return next(error);
      }
    } else if (role !== 'Resident') {
      const error = new Error('Invalid role');
      error.statusCode = 400;
      return next(error);
    }

    // Hash the password
    if (typeof password !== 'string' || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      return next(error);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Sanitize name
    const sanitizedName = name.trim();

    // Create and save the user
    const user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role,
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond with success
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, role: user.role },
      token,
    });
  } catch (error) {
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


