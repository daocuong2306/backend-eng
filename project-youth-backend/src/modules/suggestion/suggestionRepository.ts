import { MongoDbRepository } from '@src/utils/helper';

export const suggestionRepository = {
  // get random video suggestion from db
  findRandomAsync: async (limit: number) => {
    try {
      const suggestions = await MongoDbRepository.getRandomSuggestionByLimit(limit);
      return suggestions;
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
