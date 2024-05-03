import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { TypeGetHistoryResponse } from '@modules/history/historyModel';
import { historyRepository } from '@modules/history/historyRepository';

export const historyService = {
  getHistory: async (userId: string): Promise<ServiceResponse<TypeGetHistoryResponse | null>> => {
    try {
      // get history from db
      const history = await historyRepository.getHistoryAsync(userId);
      return new ServiceResponse<TypeGetHistoryResponse>(
        ResponseStatus.Success,
        'History found',
        history,
        StatusCodes.OK,
      );
    } catch (ex) {
      return new ServiceResponse<null>(
        ResponseStatus.Failed,
        (ex as Error).message,
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
};
