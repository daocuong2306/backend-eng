import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { TypeGetCouponResponse } from '@modules/coupon/couponModel';
import { couponRepository } from '@modules/coupon/couponRepository';
import { logger } from '@src/server';

export const couponService = {
  activeCoupon: async (couponId: string, userId: string): Promise<ServiceResponse<TypeGetCouponResponse | null>> => {
    try {
      // check used coupon first
      const checkUsedCoupon = await couponRepository.checkUsedCouponAsync(couponId, userId);
      if (checkUsedCoupon) {
        return new ServiceResponse(ResponseStatus.Failed, 'Coupon already used', null, StatusCodes.NOT_ACCEPTABLE);
      } else {
        const detailCoupon = await couponRepository.checkCouponStatus(couponId);
        if (!detailCoupon) {
          return new ServiceResponse(ResponseStatus.Failed, 'Error get detail coupon', null, StatusCodes.NOT_FOUND);
        }
        // update user remainPoint
        await couponRepository.updateUserPointAsync(userId, detailCoupon.bonusPoint);
        // update coupon remaining
        await couponRepository.updateCouponAsync(couponId);
        // add used coupon with user id
        await couponRepository.addUsedCouponAsync(couponId, detailCoupon.bonusPoint, detailCoupon.expired, userId);
        const message = `Coupon ${detailCoupon.code} activated, you got ${detailCoupon.bonusPoint} point. Enjoy your coupon!`;

        return new ServiceResponse<any>(ResponseStatus.Success, 'Coupon found', message, StatusCodes.OK);
      }
    } catch (ex) {
      const errorMessage = `Error when active your coupon:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
