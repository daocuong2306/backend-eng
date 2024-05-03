import { TypeUsedCouponPayload, TypeUsedCouponResponse } from '@modules/coupon/couponModel';
import { User } from '@modules/user/userModel';
import { GET_DB } from '@src/config/db-connect';
import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

export const couponRepository = {
  // check used coupon by user
  checkUsedCouponAsync: async (couponCode: string, userId: string) => {
    try {
      const listUsedCoupon: TypeUsedCouponResponse[] = await MongoDbRepository.getAllDocsByCollection(
        DB_COLLECTIONS.USED_COUPONS,
      );
      if (!listUsedCoupon) {
        throw new Error('Error when get used coupon');
      }

      const isCouponUsed: boolean = listUsedCoupon.some(
        (coupon) => coupon.code === couponCode && coupon.usedBy === userId,
      );

      return isCouponUsed;
    } catch (error: any) {
      throw new Error(error);
    }
  },

  // check status of coupon
  checkCouponStatus: async (couponCode: string) => {
    try {
      const coupon = await MongoDbRepository.getCouponDetailFromDB(couponCode);
      // check expired date
      const currentDate = new Date();
      const couponExpiredDate = new Date(coupon.expired);
      if (currentDate > couponExpiredDate) {
        throw new Error('Coupon expired');
      }
      // check remaining
      if (coupon.remainCount <= 0) {
        throw new Error('Coupon not available');
      }
      return coupon;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  // update user point
  updateUserPointAsync: async (userId: string, bonusPoint: number): Promise<User> => {
    try {
      const user = await MongoDbRepository.getUserFromDB(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // update user point
      const newUserPoint = parseInt(String(user.remainPoint)) + bonusPoint;
      const result = await MongoDbRepository.updateUserField(userId, 'remainPoint', newUserPoint);
      if (!result) {
        throw new Error('Error when update user point');
      }

      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  // upate coupon remaining and prevent user to use coupon again
  updateCouponAsync: async (couponCode: string) => {
    try {
      const coupon = await MongoDbRepository.getCouponDetailFromDB(couponCode);
      if (!coupon) {
        throw new Error('Coupon not found');
      }
      // update coupon remaining
      const newRemaining = coupon.remainCount - 1;
      const result = await GET_DB()
        .collection(DB_COLLECTIONS.COUPONS)
        .updateOne(
          { code: couponCode },
          {
            $set: {
              remainCount: newRemaining,
            },
          },
        );
      if (!result) {
        throw new Error('Error when update coupon remaining');
      }
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  },
  // save used coupon to new collection
  addUsedCouponAsync: async (couponCode: string, bonusPoint: number, expired: string, userId: string) => {
    try {
      const result = await MongoDbRepository.insertOneFieldToCollection<TypeUsedCouponPayload>(
        DB_COLLECTIONS.USED_COUPONS,
        {
          code: couponCode,
          bonusPoint: bonusPoint,
          expired: new Date(expired),
          usedAt: new Date(),
          usedBy: userId,
        },
      );
      if (!result) {
        throw new Error('Error when save used coupon');
      }
      return result;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
