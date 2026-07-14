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

  const parsedHeight = Number(height);
  const parsedWeight = Number(weight);
  const parsedTargetCalories = Number(targetCalories);

  if (
    !Number.isFinite(parsedHeight) ||
    !Number.isFinite(parsedWeight) ||
    !Number.isInteger(parsedTargetCalories) ||
    parsedHeight <= 0 ||
    parsedWeight <= 0 ||
    parsedTargetCalories <= 0
  ) {
    return res.status(400).json({
      error: 'Informe altura, peso e meta calórica válidos.',
    });
  }

  const user = await prisma.user.update({
    where: {
      id: req.userId,
    },
    data: {
      height: parsedHeight,
      weight: parsedWeight,
      targetCalories: parsedTargetCalories,
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