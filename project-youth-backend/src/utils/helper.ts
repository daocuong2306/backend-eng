import { TypeGetCouponResponse } from '@modules/coupon/couponModel';
import { TypeYoutubeSuggestionResponse } from '@modules/suggestion/suggestionModel';
import { User } from '@modules/user/userModel';
import { GET_DB } from '@src/config/db-connect';
import { DB_COLLECTIONS } from '@src/utils/constant';

type SaveSkillHistory = {
  userId: string;
  skill: string;
  createdAt: Date;
  _id?: string;
};

type InsertFieldResponse = {
  acknowledged: boolean;
  insertedId: string;
};

const sortField = { createdAt: -1 };

// get doc from collection
const getDocOfCollection = async <T>(collection: string, query: string, value: string): Promise<T> => {
  try {
    const doc = await GET_DB()
      .collection(collection)
      .findOne({ [query]: value });
    return doc;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getAllDocsByCollection = async <T>(collection: string): Promise<T[]> => {
  try {
    const docs = await GET_DB().collection(collection).find().sort(sortField).toArray();
    return docs as T[];
  } catch (error: any) {
    throw new Error(error);
  }
};

const getUserFromDB = async (id: string) => {
  // get from mongodb and return
  try {
    const user = await getDocOfCollection<User>(DB_COLLECTIONS.USERS, 'id', id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getCouponDetailFromDB = async (couponCode: string) => {
  try {
    const coupon = await getDocOfCollection<TypeGetCouponResponse>(DB_COLLECTIONS.COUPONS, 'code', couponCode);
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    return coupon;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateUserField = async (userId: string, field: string, value: any) => {
  const user = await getUserFromDB(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const result = await updateCommonField<User>(DB_COLLECTIONS.USERS, 'id', userId, field, value);

  if (!result) {
    throw new Error('Error when update user');
  }
  return result;
};

const insertOneFieldToCollection = async <T, K>(collection: string, insertedData: K): Promise<T> => {
  try {
    const res: T = await GET_DB().collection(collection).insertOne(insertedData);
    return res;
  } catch (error: any) {
    throw new Error(error);
  }
};

const getRandomSuggestionByLimit = async (limit: number) => {
  try {
    const suggestions = (await GET_DB()
      .collection(DB_COLLECTIONS.SUGGESTIONS_YOUTUBE)
      .aggregate([{ $sample: { size: limit } }])
      .toArray()) as TypeYoutubeSuggestionResponse[];
    return suggestions;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateCommonField = async <T>(
  collection: string,
  query: string,
  queryValue: string,
  field: string,
  fieldValue: any,
): Promise<T> => {
  try {
    const res = await GET_DB()
      .collection(collection)
      .updateOne({ [query]: queryValue }, { $set: { [field]: fieldValue } });
    return res;
  } catch (error: any) {
    throw new Error(error);
  }
};

const updateMultipleFields = async <T>(
  collection: string,
  query: string,
  queryValue: string,
  fields: { [key: string]: any },
): Promise<T> => {
  try {
    const res = await GET_DB()
      .collection(collection)
      .updateOne({ [query]: queryValue }, { $set: fields });
    return res;
  } catch (error: any) {
    throw new Error(error);
  }
};

const saveSkillHistory = async (userId: string, skill: string) => {
  try {
    const res = await insertOneFieldToCollection<InsertFieldResponse, SaveSkillHistory>(DB_COLLECTIONS.SKILLS_HISTORY, {
      userId,
      skill,
      createdAt: new Date(),
    });
    return res;
  } catch (error: any) {
    throw new Error(error);
  }
};

// get all docs of collection by query
const getAllDocsByQuery = async <T>(collection: string, query: string, value: string): Promise<T[]> => {
  try {
    // we get createdAt field so we need to sort it

    const docs = await GET_DB()
      .collection(collection)
      .find({ [query]: value })
      .sort(sortField)
      .toArray();
    return docs as T[];
  } catch (error: any) {
    throw new Error(error);
  }
};

export const MongoDbRepository = {
  getDocOfCollection,
  getAllDocsByCollection,
  getUserFromDB,
  getCouponDetailFromDB,
  updateUserField,
  getRandomSuggestionByLimit,
  insertOneFieldToCollection,
  updateCommonField,
  updateMultipleFields,
  saveSkillHistory,
  getAllDocsByQuery,
};
