import { v4 as uuidv4 } from 'uuid';
import { Challenge } from '../types';
import { db } from '../models/database';

export class ChallengeService {
  async createChallenge(
    challengerId: string,
    challengedId: string,
    territoryId: string,
    targetDistance?: number
  ): Promise<Challenge> {
    const challenger = db.getUser(challengerId);
    const challenged = db.getUser(challengedId);

    if (!challenger || !challenged) {
      throw new Error('User not found');
    }

    const territory = db.getTerritory(territoryId);
    if (!territory) {
      throw new Error('Territory not found');
    }

    const challenge: Challenge = {
      id: uuidv4(),
      challengerId,
      challengedId,
      territoryId,
      status: 'pending',
      targetDistance,
      createdAt: new Date()
    };

    return db.createChallenge(challenge);
  }

  async acceptChallenge(challengeId: string): Promise<Challenge> {
    const challenge = db.getChallenge(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'pending') {
      throw new Error('Challenge already processed');
    }

    const updated = db.updateChallenge(challengeId, {
      status: 'accepted',
      startDate: new Date()
    });

    if (!updated) {
      throw new Error('Failed to update challenge');
    }

    return updated;
  }

  async rejectChallenge(challengeId: string): Promise<Challenge> {
    const challenge = db.getChallenge(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'pending') {
      throw new Error('Challenge already processed');
    }

    const updated = db.updateChallenge(challengeId, {
      status: 'rejected'
    });

    if (!updated) {
      throw new Error('Failed to update challenge');
    }

    return updated;
  }

  async completeChallenge(challengeId: string, winnerId: string): Promise<Challenge> {
    const challenge = db.getChallenge(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (challenge.status !== 'accepted') {
      throw new Error('Challenge not accepted');
    }

    if (winnerId !== challenge.challengerId && winnerId !== challenge.challengedId) {
      throw new Error('Invalid winner');
    }

    const updated = db.updateChallenge(challengeId, {
      status: 'completed',
      endDate: new Date(),
      winnerId
    });

    if (!updated) {
      throw new Error('Failed to update challenge');
    }

    const winner = db.getUser(winnerId);
    if (winner) {
      const challengesWon = db.getChallenges().filter(
        c => c.status === 'completed' && c.winnerId === winnerId
      ).length;

      if (challengesWon >= 10 && !winner.badges.includes('champion')) {
        const newBadges = [...winner.badges, 'champion'];
        db.updateUser(winnerId, { badges: newBadges });
      }
    }

    return updated;
  }

  async getUserChallenges(userId: string): Promise<Challenge[]> {
    return db.getChallengesByUser(userId);
  }

  async getAllChallenges(): Promise<Challenge[]> {
    return db.getChallenges();
  }
}
