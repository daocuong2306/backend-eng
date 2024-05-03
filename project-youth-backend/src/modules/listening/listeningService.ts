import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@common/models/serviceResponse';
import { TypeListeningResponse } from '@modules/listening/listeningModel';
import { listeningRepository } from '@modules/listening/listeningRepository';
import { logger } from '@src/server';

export const listeningService = {
  postListening: async (
    linkYoutube: string,
    userId: string,
  ): Promise<ServiceResponse<TypeListeningResponse | null>> => {
    try {
      const listening = await listeningRepository.postListeningAsync({
        linkYoutube,
        userId,
      });

      return new ServiceResponse(ResponseStatus.Success, 'Successfully', listening, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = `Error : ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
  // mark listening
  markListening: async (results: string[], hash: string): Promise<ServiceResponse<string | null>> => {
    try {
      const listening = await listeningRepository.markListeningAsync({
        results,
        hash,
      });

      return new ServiceResponse(ResponseStatus.Success, 'Chasing points', listening, StatusCodes.CREATED);
    } catch (ex) {
      const errorMessage = `Error mark : ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
