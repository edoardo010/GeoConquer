import { v4 as uuidv4 } from 'uuid';
import { User, LeaderboardEntry } from '../types';
import { db } from '../models/database';
import { TerritoryService } from './territoryService';

export class UserService {
  private territoryService: TerritoryService;

  constructor() {
    this.territoryService = new TerritoryService();
  }

  async createUser(username: string, email: string): Promise<User> {
    const existing = db.getUserByUsername(username);
    if (existing) {
      throw new Error('Username already exists');
    }

    const user: User = {
      id: uuidv4(),
      username,
      email,
      totalDistance: 0,
      level: 1,
      experience: 0,
      badges: [],
      createdAt: new Date()
    };

    return db.createUser(user);
  }

  async getUser(id: string): Promise<User | undefined> {
    return db.getUser(id);
  }

  async getAllUsers(): Promise<User[]> {
    return db.getUsers();
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = db.getUsers();
    const entries: LeaderboardEntry[] = [];

    for (const user of users) {
      const totalArea = await this.territoryService.getTotalUserArea(user.id);
      entries.push({
        userId: user.id,
        username: user.username,
        totalArea,
        totalDistance: user.totalDistance,
        level: user.level,
        rank: 0
      });
    }

    entries.sort((a, b) => {
      if (b.totalArea !== a.totalArea) {
        return b.totalArea - a.totalArea;
      }
      return b.totalDistance - a.totalDistance;
    });

    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries;
  }

  async getUserStats(userId: string) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const territories = await this.territoryService.getUserTerritories(userId);
    const totalArea = await this.territoryService.getTotalUserArea(userId);
    const activities = db.getActivitiesByUser(userId);
    const challenges = db.getChallengesByUser(userId);

    return {
      user,
      stats: {
        territoriesCount: territories.length,
        totalArea,
        totalDistance: user.totalDistance,
        level: user.level,
        experience: user.experience,
        badges: user.badges,
        activitiesCount: activities.length,
        challengesCount: challenges.length,
        challengesWon: challenges.filter(c => c.status === 'completed' && c.winnerId === userId).length
      }
    };
  }
}
