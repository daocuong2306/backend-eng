import { TypeGetHistoryResponse } from '@modules/history/historyModel';
import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

export const historyRepository = {
  getHistoryAsync: async (userId: string) => {
    try {
      const res = await MongoDbRepository.getAllDocsByQuery<TypeGetHistoryResponse>(
        DB_COLLECTIONS.SKILLS_HISTORY,
        'userId',
        userId,
      );

      if (res.length > 5) {
        return res.splice(0, 5);
      }

      return res;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
