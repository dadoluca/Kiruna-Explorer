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
    // Validate email format before querying the database
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      return next(error);
    }

    // Sanitize the email and avoid direct database query construction with user input
    const sanitizedEmail = email.trim().toLowerCase();

    // Use parameterized queries (findOne with sanitized input)
    const existingUser = await User.findOne({ email: sanitizedEmail }).exec();
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      return next(error);
    }

    // Validate registration secret for Urban Planner role
    if (role === 'Urban Planner') {
      if (registrationSecret !== process.env.URBAN_PLANNER_SECRET) {
        const error = new Error('Invalid registration secret for Urban Planner');
        error.statusCode = 403;
        return next(error);
      }
    }

    // Create a new user
    const user = new User({ name, email: sanitizedEmail, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};



export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate email format before querying the database
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      return next(error);
    }

    // Sanitize the email by trimming spaces and converting to lowercase
    const sanitizedEmail = email.trim().toLowerCase();

    // Use parameterized query to avoid direct construction with user data
    const user = await User.findOne({ email: sanitizedEmail }).exec();
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Compare password with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid credentials');
      error.statusCode = 400;
      return next(error);
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with the token and user details
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
      error.statusCode = 404;
      return next(error);
    }
    res.json(user);
  } catch (error) {
    error.statusCode = 500;
    next(error);
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

//import User from './models/User';  // Assuming this is the path to the User model

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Validate email format before querying the database
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      const error = new Error('Invalid email format');
      error.statusCode = 400;
      return next(error);
    }

    // Sanitize email by trimming spaces and converting to lowercase
    const sanitizedEmail = email.trim().toLowerCase();

    // Use parameterized query to avoid direct construction with user data
    const user = await User.findOne({ email: sanitizedEmail }).exec();
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    // Generate reset token and save
    const token = user.generateResetToken();
    await user.save();

    res.json({ message: 'Password reset token generated', token });
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
};



export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    // Validate token format (assuming it's a hex string; adjust as needed)
    if (!/^[a-fA-F0-9]{40}$/.test(token)) {
      const error = new Error('Invalid token format');
      error.statusCode = 400;
      return next(error);
    }

    // Sanitize newPassword to prevent any unintended special characters (basic example)
    const sanitizedNewPassword = newPassword.trim(); // Trim any unnecessary spaces

    if (sanitizedNewPassword.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      return next(error);
    }

    // Find user by reset token and check if token is valid (not expired)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).exec();

    if (!user) {
      const error = new Error('Invalid or expired token');
      error.statusCode = 400;
      return next(error);
    }

    // Update user password and clear the reset token and expiry
    user.password = sanitizedNewPassword;
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


