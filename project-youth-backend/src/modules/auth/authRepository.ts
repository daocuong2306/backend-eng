import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  TypeChangePasswordPayload,
  TypeChangePasswordResponse,
  TypeForgotPasswordPayload,
  TypeForgotPasswordResponse,
  TypeLoginPayload,
  TypeLoginResponse,
  TypeLogoutResponse,
  TypeRegisterPayload,
} from '@modules/auth/authModel';
import { User } from '@modules/user/userModel';
import { env } from '@src/config/env';
import { nanoid } from '@src/lib/nanoid';
import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

import { TypeRegisterResponse } from './authModel';

const defaultAvatar = 'https://wallpaperaccess.com/full/3396150.jpg';

export const authRepository = {
  // register user
  registerAsync: async (payload: TypeRegisterPayload): Promise<TypeRegisterResponse> => {
    // get from mongodb and return
    try {
      // check if user already exists
      const isExistedUser = await MongoDbRepository.getDocOfCollection<User>(
        DB_COLLECTIONS.USERS,
        'email',
        payload.email,
      );
      if (isExistedUser) {
        throw new Error('User already exists');
      }
      // save user in db
      const ranId = await nanoid();
      const user: TypeRegisterResponse = {
        id: ranId,
        email: payload.email,
        username: payload.username,
        createdAt: new Date(),
        updatedAt: new Date(),
        photoUrl: defaultAvatar,
        remainPoint: Number(env.DEFAULT_REGISTER_POINT),
        gender: '',
        dob: new Date(),
        role: String(env.DEFAULT_ROLE),
        hobbies: '',
        occupation: '',
        phoneNumber: '',
        address: '',
        isVerify: false,
      };
      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  },

  // login user
  loginAsync: async (payload: TypeLoginPayload): Promise<TypeLoginResponse> => {
    // get from mongodb and return
    try {
      const user = await MongoDbRepository.getDocOfCollection<User>(DB_COLLECTIONS.USERS, 'email', payload.email);
      if (!user) {
        throw new Error('User not found');
      }

      // compare password
      const isPasswordMatch: boolean = await bcrypt.compare(payload.password, user.password);
      if (!isPasswordMatch) {
        throw new Error('Invalid email or password');
      }
      // gen token and save in db
      const jwtToken = jwt.sign(
        {
          email: user.email,
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        env.JWT_SECRET as string,
        { expiresIn: '24h' },
      );
      // hide password
      const response: TypeLoginResponse = {
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          photoUrl: user.photoUrl,
          remainPoint: user.remainPoint,
          dob: user.dob,
          gender: user.gender,
          role: user.role || '', // Ensure role is always a string
          hobbies: user.hobbies,
          occupation: user.occupation,
          phoneNumber: user.phoneNumber,
          address: user.address,
          isVerify: user.isVerify,
        },
      };
      // save token in db
      await MongoDbRepository.updateCommonField(DB_COLLECTIONS.USERS, 'id', user.id, 'token', jwtToken);

      return response;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  // change password
  changePasswordAsync: async (payload: TypeChangePasswordPayload): Promise<TypeChangePasswordResponse> => {
    // get from mongodb and return
    try {
      const res = await MongoDbRepository.getDocOfCollection<TypeChangePasswordResponse>(
        DB_COLLECTIONS.USERS,
        'email',
        payload.email,
      );
      if (!res) {
        throw new Error('User not found');
      }
      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  // forgot password
  forgotPasswordAsync: async (payload: TypeForgotPasswordPayload): Promise<TypeForgotPasswordResponse> => {
    // get from mongodb and return
    try {
      const res: TypeForgotPasswordResponse = await MongoDbRepository.getDocOfCollection<TypeForgotPasswordResponse>(
        DB_COLLECTIONS.USERS,
        'email',
        payload.email,
      );
      if (!res) {
        throw new Error('User not found');
      }
      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  // logout
  logoutAsync: async (uid: string): Promise<TypeLogoutResponse> => {
    // get from mongodb and return
    try {
      const res: TypeLogoutResponse = await MongoDbRepository.getDocOfCollection<TypeLogoutResponse>(
        DB_COLLECTIONS.USERS,
        'id',
        uid,
      );
      if (!res) {
        throw new Error('User not found');
      }
      // remove token in db
      await MongoDbRepository.updateCommonField(DB_COLLECTIONS.USERS, 'id', uid, 'token', '');

      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
