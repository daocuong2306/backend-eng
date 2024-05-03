import { DB_COLLECTIONS } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

type CreateFeedbackResponse = {
  acknowledged: boolean;
  insertedId: string;
};

type CreateFeedbackPayload = {
  userId: string;
  email: string;
  feedback: string;
  createdAt: Date;
};

export const feedbackRepository = {
  createFeedbackAsync: async (userId: string, email: string, feedback: string) => {
    try {
      const res = await MongoDbRepository.insertOneFieldToCollection<CreateFeedbackResponse, CreateFeedbackPayload>(
        DB_COLLECTIONS.FEEDBACKS,
        {
          userId,
          email,
          feedback,
          createdAt: new Date(),
        },
      );
      if (!res.insertedId) {
        throw new Error('Create feedback failed');
      }

      return 'Feedback created successfully';
    } catch (error: any) {
      throw new Error(error);
    }
  },
};
