import { Request, Response } from 'express';
import { prisma } from '../prisma';

export async function me(
  req: Request,
  res: Response,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId,
    },
    select: {
      id: true,
      githubLogin: true,
      name: true,
      avatarUrl: true,
      height: true,
      weight: true,
      targetCalories: true,
    },
  });

  return res.json(user);
}

export async function updateMeData(req: Request, res: Response) {
  const { height, weight, targetCalories } = req.body as {
    height?: unknown;
    weight?: unknown;
    targetCalories?: unknown;
  };

  const isPositiveNumber = (value: unknown) =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

  const isPositiveInteger = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value > 0;

  if (
    !isPositiveNumber(height) ||
    !isPositiveNumber(weight) ||
    !isPositiveInteger(targetCalories)
  ) {
    return res.status(400).json({
      error: 'Altura, peso e meta calórica devem conter valores válidos.',
    });
  }

  const user = await prisma.user.update({
    where: {
      id: req.userId,
    },
    data: {
      height,
      weight,
      targetCalories,
    },
    select: {
      id: true,
      githubLogin: true,
      name: true,
      avatarUrl: true,
      height: true,
      weight: true,
      targetCalories: true,
    },
  });

  return res.json(user);
}