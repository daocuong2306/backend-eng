import { TypeOccupationResponse, TypeUpdateProfileRequest, TypeVerifyCodeResponse } from '@modules/me/meModel';
import { User } from '@modules/user/userModel';
import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

export const meRepository = {
  getMeAsync: async (userId: string) => {
    try {
      const user = await MongoDbRepository.getUserFromDB(userId);
      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  getOccupationAsync: async () => {
    try {
      const res = await MongoDbRepository.getAllDocsByCollection<TypeOccupationResponse>(DB_COLLECTIONS.OCCUPATIONS);
      if (!res) {
        throw new Error('Occupation not found');
      }
      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  saveVerifyCodeAsync: async (userId: string, email: string, verifyCode: string) => {
    try {
      // check if user already have verify code
      const isExistedVerifyCode = await MongoDbRepository.getDocOfCollection(
        DB_COLLECTIONS.VERIFY_CODES,
        'userId',
        userId,
      );

      if (isExistedVerifyCode) {
        const fields = {
          verifyCode,
          expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        };
        // update verify code
        const res = await MongoDbRepository.updateMultipleFields(DB_COLLECTIONS.VERIFY_CODES, 'userId', userId, fields);
        return res;
      } else {
        const res = await MongoDbRepository.insertOneFieldToCollection(DB_COLLECTIONS.VERIFY_CODES, {
          userId,
          verifyCode,
          email,
          expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        return res;
      }
    } catch (error: any) {
      throw new Error(error);
    }
  },

  // verify code from client
  handleVerifyUserAsync: async (userId: string, verifyCode: string) => {
    try {
      const verifyCodeDoc = await MongoDbRepository.getDocOfCollection<TypeVerifyCodeResponse>(
        DB_COLLECTIONS.VERIFY_CODES,
        'userId',
        userId,
      );
      if (!verifyCodeDoc) {
        throw new Error('Verify code not found');
      }
      if (verifyCodeDoc.verifyCode !== verifyCode) {
        throw new Error('Verify code not match');
      }
      if (new Date(verifyCodeDoc.expireAt) < new Date()) {
        throw new Error('Verify code expired');
      }
      // update user isVerify field
      await MongoDbRepository.updateUserField(userId, 'isVerify', true);
      return 'User verified successfully';
    } catch (error: any) {
      throw new Error(error);
    }
  },

  updateProfileAsync: async (userId: string, data: TypeUpdateProfileRequest) => {
    try {
      const fields = {
        updatedAt: new Date(),
        ...data,
      };

      const res = (await MongoDbRepository.updateMultipleFields(DB_COLLECTIONS.USERS, 'id', userId, fields)) as User;
      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
