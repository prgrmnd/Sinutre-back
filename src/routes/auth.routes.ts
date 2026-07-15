import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { me, updateMeData } from '../controllers/auth.me';

import {
  redirectToGithub,
  githubCallback,
  logout,
} from '../controllers/auth.controller';

export const authRoutes = Router();

authRoutes.get('/github', redirectToGithub);
authRoutes.get('/github/callback', githubCallback);
authRoutes.get('/me', requireAuth, me);
authRoutes.patch('/me', requireAuth, updateMeData);
authRoutes.post('/logout', requireAuth, logout);
