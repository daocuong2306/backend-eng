import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { feedbackRepository } from '@modules/feedback/feedbackRepository';
import { logger } from '@src/server';

export const feedbackService = {
  createFeedback: async (userId: string, email: string, feedback: string): Promise<ServiceResponse<string | null>> => {
    try {
      const res: string = await feedbackRepository.createFeedbackAsync(userId, email, feedback);
      return new ServiceResponse<string>(
        ResponseStatus.Success,
        'Feedback created successfully',
        res,
        StatusCodes.CREATED,
      );
    } catch (ex: any) {
      const errorMessage = `Error creating feedback: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
