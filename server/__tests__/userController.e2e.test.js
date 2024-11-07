
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../createApp.mjs';  
import User from '../models/User.mjs';




describe('User Registration & Login API', () => {

  let app;
  let userId;
  let token;
  let resetToken;
  

beforeAll(async() => {
  try{
   await mongoose
   .connect("mongodb://localhost/your_test_db");
   console.log("Conected to MongoDB");

    const user = new User({
      name:'User Test',
      email:'user@example.com',
      password:'password123',
      role:'Urban Planner'
    });
    
     const savedUser = await user.save();
     userId = savedUser._id.toString();

     resetToken = savedUser.generateResetToken();
    

    savedUser.resetPasswordToken = resetToken;
    const tokenExpirationTime = new Date(Date.now() + 3600000);
    savedUser.resetPasswordExpires = tokenExpirationTime;
    await savedUser.save();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const loginResponse = await request(app)
    .post('/users/login')
    .send({
      email:'user@example.com',
      password:'password123'
    });

    token = loginResponse.body.token;
    console.log('Login token:', token);
  
  } catch(err){
    console.log('Error connecting to DB or saving user:',err);
  }
   
  app = createApp(); 
});

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/users/register')  
      .send({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'Resident'  
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should not allow duplicate registration', async () => {
    const response = await request(app)
      .post('/users/register')
      .send({
        name: 'Duplicate User',
        email: 'user@example.com',
        password: 'password123',
        role: 'Resident',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email already in use');
  });

  it('should log in an existing user', async () => {
    const response = await request(app)
      .post('/users/login')  
      .send({
        email: 'user@example.com',
        password: 'password123',
      });
      

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();  
  });

  it('should get a user by ID', async ()=>{
    const response = await request(app)
    .get(`/users/${userId}`)
    .expect(200);
    
    expect(response.body._id).toBe(userId);
    expect(response.body.name).toBe('User Test');
    expect(response.body.email).toBe('user@example.com');
    expect(response.body.password).toBeUndefined();
  });

  it('should update user profile', async () => {
    const response = await request(app)
      .put(`/users/${userId}/profile`)
      .send({
        name: 'Updated User'
      });
      

    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Updated User');
  });
  it('should change password successfully', async () => {
    const response = await request(app)
      .put(`/users/${userId}/change-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password changed successfully');
  });

  it('should return 400 if the current password is incorrect', async () => {
    const response = await request(app)
      .put(`/users/${userId}/change-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Current password is incorrect');
  });
   // Forgot Password Test
   it('should generate a password reset token for an existing user', async () => {
    const user = await User.findOne({ email: 'user@example.com' });
    console.log('User with reset token:', user);  
    const response = await request(app)
      .post('/users/forgot-password')
      .send({
        email: 'user@example.com',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password reset token generated');
    expect(response.body.token).toBeDefined();  
  });


   // Reset Password Test
   it('should reset password successfully', async () => {
    const response = await request(app)
      .post('/users/reset-password')
      .send({
        token: resetToken,
        newPassword: 'newpassword123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Password has been reset');
  });

   it('should return 400 if the token is invalid or expired', async () => {
    const response = await request(app)
      .post('/users/reset-password')
      .send({
        token: 'invalidtoken',
        newPassword: 'newpassword123',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  // Test: Deleting User Account
  it('should delete user account successfully', async () => {
    const response = await request(app)
      .delete(`/users/${userId}`)  
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User account deleted');
  });

  // Test: Trying to delete a non-existent user
  it('should return 404 if user not found', async () => {
    const nonExistentUserId = '605c72ef1532073b6f7b08c3';
    const response = await request(app)
    .delete(`/users/${nonExistentUserId}`)  
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should update user role successfully', async () => {
    const response = await request(app)
      .put(`/users/${userId}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'Visitor'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.role).toBe('Visitor');
  });

  it('should return 404 if user not found', async () => {
    const invalidUserId = new mongoose.Types.ObjectId().toString();
    
    const response = await request(app)
      .put(`/users/${invalidUserId}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        role: 'Resident',
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });


  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

});
