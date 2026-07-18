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
      // Verifica se a altura está em centímetros (ex: 175) e converte para metros (1.75)
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

