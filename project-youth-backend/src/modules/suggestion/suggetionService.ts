import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { TypeYoutubeSuggestionResponse } from '@modules/suggestion/suggestionModel';
import { suggestionRepository } from '@modules/suggestion/suggestionRepository';
import { logger } from '@src/server';

export const suggestionService = {
  getYoutubeSuggestion: async (limit: number): Promise<ServiceResponse<TypeYoutubeSuggestionResponse[] | null>> => {
    try {
      const res = await suggestionRepository.findRandomAsync(limit);
      if (!res) {
        return new ServiceResponse(ResponseStatus.Failed, 'No youtube suggestion found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<TypeYoutubeSuggestionResponse[]>(
        ResponseStatus.Success,
        'Youtube suggestion found',
        res,
        StatusCodes.OK,
      );
    } catch (ex: any) {
      const errorMessage = `Error finding youtube suggestion: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
