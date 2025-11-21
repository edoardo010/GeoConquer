import { v4 as uuidv4 } from 'uuid';
import { Territory, Coordinates, Activity } from '../types';
import { db } from '../models/database';
import { calculatePolygonArea, generateTerritoryFromRoute, calculateRouteDistance, calculateExperienceGain, calculateLevel } from '../utils/geoUtils';

export class TerritoryService {
  async createTerritoryFromActivity(userId: string, route: Coordinates[]): Promise<Territory> {
    const territoryCoordinates = generateTerritoryFromRoute(route);
    const area = calculatePolygonArea(territoryCoordinates);

    const territory: Territory = {
      id: uuidv4(),
      userId,
      coordinates: territoryCoordinates,
      area,
      conqueredAt: new Date(),
      lastVisited: new Date()
    };

    return db.createTerritory(territory);
  }

  async getUserTerritories(userId: string): Promise<Territory[]> {
    return db.getTerritoriesByUser(userId);
  }

  async getTotalUserArea(userId: string): Promise<number> {
    const territories = await this.getUserTerritories(userId);
    return territories.reduce((total, territory) => total + territory.area, 0);
  }

  async getAllTerritories(): Promise<Territory[]> {
    return db.getTerritories();
  }

  async recordActivity(userId: string, route: Coordinates[], duration: number): Promise<Activity> {
    const distance = calculateRouteDistance(route);
    const averageSpeed = duration > 0 ? (distance / duration) * 3600 : 0;

    const territory = await this.createTerritoryFromActivity(userId, route);

    const activity: Activity = {
      id: uuidv4(),
      userId,
      route,
      distance,
      duration,
      averageSpeed,
      territoriesConquered: [territory.id],
      timestamp: new Date()
    };

    db.createActivity(activity);

    const user = db.getUser(userId);
    if (user) {
      const newTotalDistance = user.totalDistance + distance;
      const experienceGain = calculateExperienceGain(distance, 1);
      const newExperience = user.experience + experienceGain;
      const newLevel = calculateLevel(newExperience);

      const newBadges = [...user.badges];
      
      if (user.badges.length === 0) {
        newBadges.push('first-step');
      }
      
      const userTerritories = await this.getUserTerritories(userId);
      if (userTerritories.length >= 5 && !user.badges.includes('explorer')) {
        newBadges.push('explorer');
      }
      if (userTerritories.length >= 20 && !user.badges.includes('conqueror')) {
        newBadges.push('conqueror');
      }
      if (newTotalDistance >= 42000 && !user.badges.includes('marathon')) {
        newBadges.push('marathon');
      }

      db.updateUser(userId, {
        totalDistance: newTotalDistance,
        experience: newExperience,
        level: newLevel,
        badges: newBadges
      });
    }

    return activity;
  }
}
