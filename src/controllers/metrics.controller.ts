import { Request, Response } from 'express';
import { prisma } from '../prisma';

export async function getMetrics(req: Request, res: Response) {
  const userId = req.userId!;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { weight: true, height: true },
    });

    let imcData = null;

    if (user && user.weight && user.height) {
      const heightInMeters = user.height > 3 ? user.height / 100 : user.height;
      
      const calcImc = user.weight / (heightInMeters * heightInMeters);
      const imcValue = Number(calcImc.toFixed(1));

      let classification = '';
      if (imcValue < 18.5) classification = 'Abaixo do peso';
      else if (imcValue < 25) classification = 'Peso normal';
      else if (imcValue < 30) classification = 'Sobrepeso';
      else classification = 'Obesidade';

      imcData = {
        value: imcValue,
        classification,
      };
    }

const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentMeals = await prisma.meal.findMany({
      where: {
        userId,
        eatTime: {
          gte: sevenDaysAgo,
          lte: today,
        },
      },
      include: {
        foods: {
          include: { food: true },
        },
      },
    });