import { Request, Response } from 'express';
import { prisma } from '../prisma';

export async function meals(
  req: Request,
  res: Response,
) {
  const meals = await prisma.meal.findMany({
    where: {
      userId: req.userId,
    },

    include: {
      foods: {
        include: {
          food: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  const result = meals.map((meal) => {
    const totals = meal.foods.reduce(
      (acc, item) => {
        const factor = item.foodG / 100;

        acc.grams += item.foodG;

        acc.calories +=
          item.food.caloriesPer100g *
          factor;

        acc.carbs +=
          item.food.carbsPer100g *
          factor;

        acc.proteins +=
          item.food.proteinPer100g *
          factor;

        acc.fats +=
          item.food.fatPer100g *
          factor;

        return acc;
      },
      {
        grams: 0,
        calories: 0,
        carbs: 0,
        proteins: 0,
        fats: 0,
      },
    );

    return {
      id: meal.id,
      name: meal.description,
      type: meal.type,
      createdAt: meal.createdAt,
      eatTime: meal.eatTime,

      totals,

      items: meal.foods,
    };
  });

  return res.json(result);
}

export async function createMeal(
  req: Request,
  res: Response,
) {
  const userId = req.userId!;

  const {
    type,
    eatTime,
    description,
    items,
  } = req.body;

  const meal = await prisma.$transaction(
    async (tx) => {
      // Busca os alimentos envolvidos
      const foods = await tx.food.findMany({
        where: {
          id: {
            in: items.map(
              (i: { foodId: number }) =>
                i.foodId,
            ),
          },

          userId,
        },
      });

      if (foods.length !== items.length) {
        throw new Error(
          'Alimento não encontrado',
        );
      }

      // Cria a refeição
      const meal = await tx.meal.create({
        data: {
          type,
          eatTime: new Date(eatTime),
          description,
          userId,
        },
      });

      // Cria MealFood
      await tx.mealFood.createMany({
        data: items.map(
          (
            item: {
              foodId: number;
              grams: number;
            },
          ) => {
            const food = foods.find(
              (f) => f.id === item.foodId,
            )!;

            return {
              mealId: meal.id,

              foodId: food.id,

              foodG: item.grams,

              calories:
                (food.caloriesPer100g *
                  item.grams) /
                100,

              carbs:
                (food.carbsPer100g *
                  item.grams) /
                100,

              protein:
                (food.proteinPer100g *
                  item.grams) /
                100,

              fat:
                (food.fatPer100g *
                  item.grams) /
                100,
            };
          },
        ),
      });

      return meal;
    },
  );

  return res.status(201).json(meal);
}

export async function checkDailyGoal(req: Request, res: Response) {
  const userId = req.userId!;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { targetCalories: true },
    });

    if (!user || !user.targetCalories) {
      return res.json({ 
        exceeded: false, 
        totalCalories: 0, 
        targetCalories: 0 
      });
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const todayMeals = await prisma.meal.findMany({
      where: {
        userId,
        eatTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        foods: {
          include: { food: true },
        },
      },
    });

    let totalCalories = 0;
    
    todayMeals.forEach((meal) => {
      meal.foods.forEach((item) => {
        const factor = item.foodG / 100;
        totalCalories += item.food.caloriesPer100g * factor;
      });
    });

    const exceeded = totalCalories > user.targetCalories;

    return res.json({
      exceeded,
      totalCalories: Math.round(totalCalories),
      targetCalories: user.targetCalories,
    });
    
  } catch (error) {
    console.error('Erro ao verificar meta diária:', error);
    return res.status(500).json({ error: 'Erro interno ao calcular meta.' });
  }
}