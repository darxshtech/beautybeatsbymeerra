const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../../utils/errorHandler');

class AuthService {
  /**
   * Login user and return token
   */
  /**
   * Google login/signup
   */
  async googleLogin(idToken) {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if user exists by googleId (sub) or email
    let user = await User.findOne({ 
      $or: [{ googleId: sub }, { email }]
    });

    if (!user) {
      // Create a user with minimal info - they will be prompted to complete profile on frontend
      // Setting a dummy phone initially if required by schema, but better to allow null in schema
      user = await User.create({
        name,
        email,
        googleId: sub,
        role: 'CUSTOMER',
        isProfileComplete: false
      });
    } else if (!user.googleId) {
      // Link existing email to google account
      user.googleId = sub;
      await user.save();
    }

    const response = this.sendTokenResponse(user);
    response.isProfileComplete = user.isProfileComplete !== false; // handle legacy users
    return response;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new ErrorResponse('Please provide an email and password', 400);
    }

    // Check for hardcoded admin first (Induction Credentials from .env)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
       return this.sendTokenResponse({
         _id: 'SYSTEM_ADMIN_ID', // Pseudo ID
         name: 'System Admin',
         email: process.env.ADMIN_EMAIL,
         role: 'ADMIN'
       });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    return this.sendTokenResponse(user);
  }

  /**
   * Register user and return token
   */
  async register(data) {
    const { name, email, password, phone, role } = data;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new ErrorResponse('User already exists', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'CUSTOMER'
    });

    return this.sendTokenResponse(user);
  }

  /**
   * Get token from model, create cookie and send response
   */
  sendTokenResponse(user) {
    // Create token
    const token = this.getSignedJwtToken(user);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Sign JWT and return
   */
  getSignedJwtToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d' // Production use should be shorter + refresh token logic
    });
  }
}

module.exports = new AuthService();
