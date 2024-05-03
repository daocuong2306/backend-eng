import {
  TypeDbListeningResponse,
  TypeGenListeningPayload,
  TypeListeningResponse,
  TypeMarkListeningPayload,
} from '@modules/listening/listeningModel';
import axiosInstance from '@src/config/connection-instance';
import { DB_COLLECTIONS, SKILLS_NAME } from '@src/utils/constant';
import { MongoDbRepository } from '@src/utils/helper';

export const listeningRepository = {
  postListeningAsync: async (payload: TypeGenListeningPayload): Promise<TypeListeningResponse> => {
    try {
      const user = await MongoDbRepository.getUserFromDB(payload.userId);
      if (user) {
        // Kiểm tra xem trường remainPoint có tồn tại không trước khi giảm đi 1
        if (user.remainPoint !== undefined) {
          user.remainPoint -= 1;
          // Cập nhật dữ liệu trong cơ sở dữ liệu
          await MongoDbRepository.updateUserField(payload.userId, 'remainPoint', user.remainPoint);
          // save skill history
          await MongoDbRepository.saveSkillHistory(payload.userId, SKILLS_NAME.LISTENING);
        } else {
          throw new Error('remainPoint is undefined');
        }
      } else {
        throw new Error('User not found');
      }

      const data = {
        id: payload.userId,
        url: payload.linkYoutube,
        num_quizz: 10,
      };

      const response = await axiosInstance.post('listening/gen_quizz', data);

      // save into db
      await MongoDbRepository.insertOneFieldToCollection(DB_COLLECTIONS.LISTENING_RESULTS, {
        url: payload.linkYoutube,
        resultId: response.data.id,
        result: response.data,
        createdAt: new Date(),
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to post listening data: ' + error);
    }
  },

  // mark listening
  markListeningAsync: async (payload: TypeMarkListeningPayload) => {
    try {
      const listeningResults = await MongoDbRepository.getDocOfCollection<TypeDbListeningResponse>(
        DB_COLLECTIONS.LISTENING_RESULTS,
        'resultId',
        payload.hash,
      );
      const formArray = listeningResults.result.form;
      let score = 0;
      if (formArray.length !== payload.results.length) {
        return 'Number of answers do not match!';
      }
      for (let i = 0; i < formArray.length; i++) {
        const answer = formArray?.[i]?.answer;
        const payloadAnswer = payload.results[i];
        // Compare answer with payload answer
        if (answer === payloadAnswer) {
          score++; // Increment score if answer matches
        }
      }
      // Return the score
      return `Score: ${score}/${formArray.length}`;
    } catch (error) {
      throw new Error('Could not find listening data: ' + error);
    }
  },
};
