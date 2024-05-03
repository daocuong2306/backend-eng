import { TypeGetCouponResponse } from '@modules/coupon/couponModel';
import { User } from '@modules/user/userModel';
import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

export const userRepository = {
  findAllAsync: async (): Promise<User[]> => {
    // get from mongodb and return
    try {
      const user: User | never[] = await MongoDbRepository.getAllDocsByCollection(DB_COLLECTIONS.USERS);
      return Array.isArray(user) ? user : [];
    } catch (error: any) {
      throw new Error(error);
    }
  },

  findByIdAsync: async (id: string): Promise<User | null> => {
    // get from mongodb and return
    try {
      const user = await MongoDbRepository.getUserFromDB(id);
      return user;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  getCouponAsync: async (): Promise<TypeGetCouponResponse[] | null> => {
    // get from mongodb and return
    try {
      const coupon: TypeGetCouponResponse[] | null = await MongoDbRepository.getAllDocsByCollection(
        DB_COLLECTIONS.COUPONS,
      );
      return coupon;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
