import express from 'express';

import { authRouter } from '@modules/auth/authRouter';
import { couponRouter } from '@modules/coupon/couponRoute';
import { feedbackRouter } from '@modules/feedback/feedbackRoute';
import { healthCheckRouter } from '@modules/healthCheck/healthCheckRouter';
import { historyRoute } from '@modules/history/historyRoute';
import { listeningRouter } from '@modules/listening/listeningRouter';
import { meRouter } from '@modules/me/meRouter';
import { suggestionRouter } from '@modules/suggestion/suggestionRoute';
import { userRouter } from '@modules/user/userRouter';

const Router = express.Router();

Router.use('/health-check', healthCheckRouter);
Router.use('/admin', userRouter);
Router.use('/auth', authRouter);
Router.use('/', meRouter);
Router.use('/suggestion', suggestionRouter);
Router.use('/feedback', feedbackRouter);
Router.use('/coupon', couponRouter);
Router.use('/listening', listeningRouter);
Router.use('/history', historyRoute);

export const APIS_V1 = Router;
