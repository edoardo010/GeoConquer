import { Request, Response } from 'express';
import { ChallengeService } from '../services/challengeService';

const challengeService = new ChallengeService();

export const createChallenge = async (req: Request, res: Response) => {
  try {
    const { challengerId, challengedId, territoryId, targetDistance } = req.body;

    if (!challengerId || !challengedId || !territoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const challenge = await challengeService.createChallenge(
      challengerId,
      challengedId,
      territoryId,
      targetDistance
    );
    res.status(201).json(challenge);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const acceptChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = await challengeService.acceptChallenge(id);
    res.json(challenge);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const rejectChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challenge = await challengeService.rejectChallenge(id);
    res.json(challenge);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const completeChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { winnerId } = req.body;

    if (!winnerId) {
      return res.status(400).json({ error: 'Winner ID is required' });
    }

    const challenge = await challengeService.completeChallenge(id, winnerId);
    res.json(challenge);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getUserChallenges = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const challenges = await challengeService.getUserChallenges(userId);
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    const challenges = await challengeService.getAllChallenges();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
