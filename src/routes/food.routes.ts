import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { prisma } from '../prisma';

export const foodRouter = Router();

//foods/
foodRouter.get('/', requireAuth, async (req, res) => {
  const search = String(req.query.search ?? '');
  const foods = await prisma.food.findMany({
    where: {
      userId: req.userId!,
      name: {
        contains: search,
      }
    },
    take: 10,
    orderBy: {
      name: 'asc',
    },
  });

  return res.json(foods);
});


foodRouter.post('/', requireAuth, async (req, res) => {
  const {
    name,
    caloriesPer100g,
    carbsPer100g,
    proteinPer100g,
    fatPer100g,
  } = req.body;

  const food = await prisma.food.create({
    data: {
      name,
      caloriesPer100g,
      carbsPer100g,
      proteinPer100g,
      fatPer100g,
      userId: req.userId!,
    },
  });

  return res.status(201).json(food);
});

foodRouter.delete('/:id', requireAuth, async (req, res) => {
  const foodId = Number(req.params.id);

  if (!foodId) {
    return res.status(400).json({ error: 'ID do alimento inválido.' });
  }

  try {
    const deletedFood = await prisma.food.deleteMany({
      where: {
        id: foodId,
        userId: req.userId!,
      },
    });

    if (deletedFood.count === 0) {
      return res.status(404).json({ error: 'Alimento não encontrado ou você não tem permissão para excluí-lo.' });
    }

    return res.status(200).json({ message: 'Alimento excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir alimento:', error);
    return res.status(500).json({ error: 'Erro interno ao tentar excluir o alimento.' });
  }
});