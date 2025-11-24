import { v4 as uuidv4 } from 'uuid';
import { Activity, ActivityStats, ActivityFilter } from '../types/activity';
import { dataService } from './dataService';

export class ActivityService {
  private activities: Map<string, Activity> = new Map();
  private userActivities: Map<string, string[]> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  // Carica dati da file
  private loadFromDisk(): void {
    const data = dataService.readData('activities.json', {});
    this.activities = new Map(Object.entries(data));
    
    // Ricostruisci userActivities
    this.userActivities.clear();
    this.activities.forEach(activity => {
      if (!this.userActivities.has(activity.userId)) {
        this.userActivities.set(activity.userId, []);
      }
      this.userActivities.get(activity.userId)!.push(activity.id);
    });
  }

  // Salva dati su file
  private saveToDisk(): void {
    const data = Object.fromEntries(this.activities);
    dataService.writeData('activities.json', data);
  }

  async createActivity(
    userId: string,
    username: string,
    type: string,
    title: string,
    distance: number,
    duration: number,
    calories: number,
    startTime: Date,
    endTime: Date,
    coordinates: any[],
    avgSpeed: number,
    maxSpeed: number,
    elevation: number = 0,
    description?: string,
    weather?: string,
    temperature?: number,
    imageUrl?: string,
    loggedByAdmin?: string
  ): Promise<Activity> {
    const id = uuidv4();
    const activity: Activity = {
      id,
      userId,
      username,
      type: type as any,
      title,
      description,
      distance,
      duration,
      calories,
      startTime,
      endTime,
      coordinates,
      avgSpeed,
      maxSpeed,
      elevation,
      weather,
      temperature,
      imageUrl,
      loggedBy: loggedByAdmin ? 'admin' : 'user',
      loggedByAdmin,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activities.set(id, activity);

    if (!this.userActivities.has(userId)) {
      this.userActivities.set(userId, []);
    }
    this.userActivities.get(userId)!.push(id);

    this.saveToDisk();
    return activity;
  }

  async getActivityById(id: string): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getUserActivities(userId: string, limit: number = 100): Promise<Activity[]> {
    const activityIds = this.userActivities.get(userId) || [];
    return activityIds
      .map(id => this.activities.get(id))
      .filter((a): a is Activity => !!a)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async getAllActivities(limit: number = 100): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async getActivitiesByFilter(filter: ActivityFilter, limit: number = 100): Promise<Activity[]> {
    let activities = Array.from(this.activities.values());

    if (filter.userId) {
      activities = activities.filter(a => a.userId === filter.userId);
    }

    if (filter.type) {
      activities = activities.filter(a => a.type === filter.type);
    }

    if (filter.startDate) {
      activities = activities.filter(a => new Date(a.startTime) >= filter.startDate!);
    }

    if (filter.endDate) {
      activities = activities.filter(a => new Date(a.endTime) <= filter.endDate!);
    }

    if (filter.minDistance) {
      activities = activities.filter(a => a.distance >= filter.minDistance!);
    }

    if (filter.maxDistance) {
      activities = activities.filter(a => a.distance <= filter.maxDistance!);
    }

    if (filter.loggedBy) {
      activities = activities.filter(a => a.loggedBy === filter.loggedBy);
    }

    return activities
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async getUserStats(userId: string): Promise<ActivityStats> {
    const activities = await this.getUserActivities(userId, 1000);
    const approved = activities; // In future, filtrare per attività approvate

    const totalDistance = approved.reduce((sum, a) => sum + a.distance, 0);
    const totalDuration = approved.reduce((sum, a) => sum + a.duration, 0);
    const totalCalories = approved.reduce((sum, a) => sum + a.calories, 0);
    const totalActivities = approved.length;

    const byType = {
      running: approved.filter(a => a.type === 'running').length,
      walking: approved.filter(a => a.type === 'walking').length,
      cycling: approved.filter(a => a.type === 'cycling').length,
      hiking: approved.filter(a => a.type === 'hiking').length
    };

    const speeds = approved.map(a => a.avgSpeed);
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b) / speeds.length : 0;

    const types = [
      { type: 'running', count: byType.running },
      { type: 'walking', count: byType.walking },
      { type: 'cycling', count: byType.cycling },
      { type: 'hiking', count: byType.hiking }
    ];
    const favoriteType = types.reduce((a, b) => a.count > b.count ? a : b, types[0]).type;

    return {
      totalActivities,
      totalDistance,
      totalDuration,
      totalCalories,
      averageSpeed: avgSpeed,
      favoriteType,
      activitiesByType: byType
    };
  }

  async getAdminStats(): Promise<{
    totalActivities: number;
    activitiesByUser: number;
    activitiesByType: { [key: string]: number };
    totalDistance: number;
    totalCalories: number;
  }> {
    const activities = Array.from(this.activities.values());

    const byType: { [key: string]: number } = {};
    activities.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    return {
      totalActivities: activities.length,
      activitiesByUser: this.userActivities.size,
      activitiesByType: byType,
      totalDistance: activities.reduce((sum, a) => sum + a.distance, 0),
      totalCalories: activities.reduce((sum, a) => sum + a.calories, 0)
    };
  }

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;

    const updated = { ...activity, ...updates, updatedAt: new Date() };
    this.activities.set(id, updated);
    this.saveToDisk();
    return updated;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const activity = this.activities.get(id);
    if (!activity) return false;

    const userActivities = this.userActivities.get(activity.userId) || [];
    this.userActivities.set(
      activity.userId,
      userActivities.filter(aid => aid !== id)
    );

    this.activities.delete(id);
    this.saveToDisk();
    return true;
  }

  async getRecentActivities(days: number = 7, limit: number = 50): Promise<Activity[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return Array.from(this.activities.values())
      .filter(a => new Date(a.startTime) >= since)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }
}

export const activityService = new ActivityService();
