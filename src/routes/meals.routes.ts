import { Router } from 'express';
import { createMeal, meals, checkDailyGoal, updateMeal, deleteMeal } from '../controllers/meals.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export const mealsRoutes = Router();

mealsRoutes.get('/goal-status', requireAuth, checkDailyGoal);
mealsRoutes.post('/', requireAuth, createMeal);
mealsRoutes.get('/', requireAuth, meals);
mealsRoutes.put('/:id', requireAuth, updateMeal);
mealsRoutes.delete('/:id', requireAuth, deleteMeal);