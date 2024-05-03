import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { TypeGetCouponResponse } from '@modules/coupon/couponModel';
import { User } from '@modules/user/userModel';
import { userRepository } from '@modules/user/userRepository';
import { logger } from '@src/server';

export const userService = {
  // Retrieves all users from the database
  findAll: async (): Promise<ServiceResponse<User[] | null>> => {
    try {
      const users = await userRepository.findAllAsync();
      if (!users) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Users found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<User[]>(ResponseStatus.Success, 'Users found', users, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Retrieves a single user by their ID
  findById: async (id: string): Promise<ServiceResponse<User | null>> => {
    try {
      const user = await userRepository.findByIdAsync(id);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<User>(ResponseStatus.Success, 'User found', user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // get list coupon
  getCoupon: async (userId: string, role: string): Promise<ServiceResponse<TypeGetCouponResponse[] | null>> => {
    if (!userId || !role) {
      return new ServiceResponse(ResponseStatus.Failed, 'Invalid request', null, StatusCodes.BAD_REQUEST);
    }

    if (role !== 'admin') {
      return new ServiceResponse(
        ResponseStatus.Failed,
        'You are not authorized to perform this action',
        null,
        StatusCodes.UNAUTHORIZED,
      );
    }

    try {
      const res = await userRepository.getCouponAsync();
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'Coupon not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<TypeGetCouponResponse[]>(
        ResponseStatus.Success,
        'Coupon found',
        res || [],
        StatusCodes.OK,
      );
    } catch (ex) {
      const errorMessage = `Error finding coupon, please try again:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
