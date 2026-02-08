import { Router } from 'express';
import { scoreController } from '../controllers/score.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const scoreRoutes = Router();

scoreRoutes.use(authMiddleware);

scoreRoutes.post('/', scoreController.saveScore);
scoreRoutes.get('/card', scoreController.getScoreCard);
