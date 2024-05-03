import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { handleSendVerificationEmail } from '@modules/auth/authService';
import { TypeOccupationResponse, TypeUpdateProfileRequest } from '@modules/me/meModel';
import { meRepository } from '@modules/me/meRepository';
import { User } from '@modules/user/userModel';
import { env } from '@src/config/env';
import { generateRandomString } from '@src/lib/random-verify-code';
import { logger } from '@src/server';
import { MongoDbRepository } from '@src/utils/helper';

export const meService = {
  // get my profile
  getMyProfile: async (userId: string): Promise<ServiceResponse<User | null>> => {
    try {
      const res = await meRepository.getMeAsync(userId);
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }

      // remove password from response
      delete (res as { password?: any }).password;

      return new ServiceResponse<User>(ResponseStatus.Success, 'User found', res, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${userId}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
  getOccupation: async (userId: string): Promise<ServiceResponse<TypeOccupationResponse[] | null>> => {
    try {
      const res = await meRepository.getOccupationAsync();
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'Occupation not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<TypeOccupationResponse[]>(
        ResponseStatus.Success,
        'Occupation found',
        res,
        StatusCodes.OK,
      );
    } catch (ex: any) {
      const errorMessage = `Error finding occupation with id ${userId}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
  generateVerifyCode: async (userId: string, userEmail: string): Promise<ServiceResponse<string | null>> => {
    try {
      const verifyCode = generateRandomString(8);
      // add expired after 2 hour and save to db
      await meRepository.saveVerifyCodeAsync(userId, userEmail, verifyCode);
      // sent mail to user
      const mailOptions = {
        from: `"Support Youth Appplication" <${env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Verify your email address',
        text: `Your verify code is ${verifyCode}`,
      };
      await handleSendVerificationEmail(mailOptions);
      return new ServiceResponse<string>(ResponseStatus.Success, 'Verify code generated', verifyCode, StatusCodes.OK);
    } catch (error: any) {
      const errorMessage = `Error generating verify code for user with id ${userId}:, ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.NOT_ACCEPTABLE);
    }
  },
  // handle verify user
  handleVerifyUser: async (userId: string, verifyCode: string): Promise<ServiceResponse<string | null>> => {
    try {
      const res = await meRepository.handleVerifyUserAsync(userId, verifyCode);

      return new ServiceResponse<string>(ResponseStatus.Success, 'User verified', res, StatusCodes.OK);
    } catch (error: any) {
      const errorMessage = `Cannot verify your account, please try later. ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.NOT_ACCEPTABLE);
    }
  },
  updateProfile: async (userId: string, data: TypeUpdateProfileRequest): Promise<ServiceResponse<User | null>> => {
    try {
      // find user in db
      const currentUser = await MongoDbRepository.getUserFromDB(userId);
      if (!currentUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }

      const res = await meRepository.updateProfileAsync(userId, data);
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<User>(ResponseStatus.Success, 'User updated', res, StatusCodes.OK);
    } catch (error: any) {
      const errorMessage = `Cannot update your profile, please try later. ${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.NOT_ACCEPTABLE);
    }
  },
};
