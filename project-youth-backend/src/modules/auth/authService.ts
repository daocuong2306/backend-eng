import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import nodemailer from 'nodemailer';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { TypeForgotPasswordResponse, TypeLoginResponse, TypeRegisterResponse } from '@modules/auth/authModel';
import { authRepository } from '@modules/auth/authRepository';
import { GET_DB } from '@src/config/db-connect';
import { env } from '@src/config/env';
import { generateRandomString } from '@src/lib/random-verify-code';
import { logger } from '@src/server';
import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

export const handleSendVerificationEmail = async (val: any) => {
  try {
    await transporter.sendMail(val);
    return 'OK';
  } catch (error) {
    return error;
  }
};

export const authService = {
  register: async (
    email: string,
    password: string,
    username: string,
  ): Promise<ServiceResponse<TypeRegisterResponse>> => {
    try {
      const checkUserExisted = await authRepository.registerAsync({
        email,
        password,
        username,
      });
      // bcrypt password
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);
      const userSaved = {
        ...checkUserExisted,
        password: hashPassword,
      };

      await MongoDbRepository.insertOneFieldToCollection(DB_COLLECTIONS.USERS, userSaved);
      return new ServiceResponse(
        ResponseStatus.Success,
        'User registered successfully',
        checkUserExisted,
        StatusCodes.CREATED,
      );
    } catch (ex) {
      const errorMessage = `Error registering user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse<any>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // login
  login: async (email: string, password: string): Promise<ServiceResponse<TypeLoginResponse | null>> => {
    try {
      const user: TypeLoginResponse | null = await authRepository.loginAsync({ email, password });

      if (user) {
        return new ServiceResponse(ResponseStatus.Success, 'User logged in successfully', user, StatusCodes.OK);
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'Invalid email or password', null, StatusCodes.UNAUTHORIZED);
      }
    } catch (ex) {
      const errorMessage = `Error logging in user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // forgot password
  forgotPassword: async (email: string): Promise<ServiceResponse<TypeForgotPasswordResponse | null>> => {
    try {
      const res = await authRepository.forgotPasswordAsync({ email });

      if (res) {
        const newPassword = generateRandomString(8);
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(newPassword, salt);
        const mailOptions = {
          from: `"Support Youth Appplication" <${env.EMAIL_USER}>`,
          to: email,
          subject: 'Reset your password',
          text: `Your new password is ${newPassword}`,
        };

        await GET_DB()
          .collection(DB_COLLECTIONS.USERS)
          .updateOne({ email }, { $set: { password: hashPassword } });
        await handleSendVerificationEmail(mailOptions);

        return new ServiceResponse(
          ResponseStatus.Success,
          'An email has been sent to your email address to reset your password',
          res,
          StatusCodes.OK,
        );
      } else {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
    } catch (ex) {
      const errorMessage = `Error sending email to reset password: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
  // change password
  changePassword: async (email: string, oldPassword: string, newPassword: string): Promise<ServiceResponse<any>> => {
    try {
      const res = await authRepository.changePasswordAsync({ email, oldPassword, newPassword });
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }

      const isPasswordMatch: boolean = await bcrypt.compare(oldPassword, res.password);
      if (!isPasswordMatch) {
        return new ServiceResponse(ResponseStatus.Failed, 'Invalid old password', null, StatusCodes.UNAUTHORIZED);
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(newPassword, salt);

      await GET_DB()
        .collection(DB_COLLECTIONS.USERS)
        .updateOne({ email }, { $set: { password: hashPassword } });

      const mailOptions = {
        from: `"Support Youth Appplication" <${env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Changed',
        text: `Your password has been changed`,
      };

      await handleSendVerificationEmail(mailOptions);

      return new ServiceResponse(ResponseStatus.Success, 'Password changed successfully', null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error changing password: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // logout
  logout: async (uid: string): Promise<ServiceResponse<string | null>> => {
    try {
      const res = await authRepository.logoutAsync(uid);
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse(ResponseStatus.Success, 'User logged out successfully', null, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error logging out user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
