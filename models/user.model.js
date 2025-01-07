
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Define Zod schema for validation
const UserZodSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  roles: z.array(z.enum(['Admin', 'Manager', 'User'])).optional().default(['User']),
});

// Mongoose Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: [String], enum: ['Admin', 'Manager', 'User'], default: ['User'] },
  createdAt: { type: Date, default: Date.now },
});

// Password hashing middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to validate data with Zod
UserSchema.statics.validateUserData = (data) => {
  try {
    return UserZodSchema.parse(data);
  } catch (error) {
    throw new Error(error.errors.map((e) => e.message).join(', '));
  }
};

// Export Mongoose model
const User = mongoose.model('User', UserSchema);
export default User;
