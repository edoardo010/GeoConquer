import { User, Territory, Challenge, Activity, Badge } from '../types';

export class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private territories: Map<string, Territory> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private activities: Map<string, Activity> = new Map();
  private badges: Map<string, Badge> = new Map();

  constructor() {
    this.initializeBadges();
  }

  private initializeBadges() {
    const defaultBadges: Badge[] = [
      {
        id: 'first-step',
        name: 'Primo Passo',
        description: 'Completa la tua prima attività',
        icon: '🚶',
        requirement: 'first_activity'
      },
      {
        id: 'explorer',
        name: 'Esploratore',
        description: 'Conquista 5 territori',
        icon: '🗺️',
        requirement: '5_territories'
      },
      {
        id: 'conqueror',
        name: 'Conquistatore',
        description: 'Conquista 20 territori',
        icon: '👑',
        requirement: '20_territories'
      },
      {
        id: 'marathon',
        name: 'Maratoneta',
        description: 'Percorri 42 km in totale',
        icon: '🏃',
        requirement: '42km_distance'
      },
      {
        id: 'champion',
        name: 'Campione',
        description: 'Vinci 10 sfide',
        icon: '🏆',
        requirement: '10_challenges_won'
      }
    ];

    defaultBadges.forEach(badge => this.badges.set(badge.id, badge));
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (user) {
      const updated = { ...user, ...updates };
      this.users.set(id, updated);
      return updated;
    }
    return undefined;
  }

  getTerritories(): Territory[] {
    return Array.from(this.territories.values());
  }

  getTerritory(id: string): Territory | undefined {
    return this.territories.get(id);
  }

  getTerritoriesByUser(userId: string): Territory[] {
    return Array.from(this.territories.values()).filter(t => t.userId === userId);
  }

  createTerritory(territory: Territory): Territory {
    this.territories.set(territory.id, territory);
    return territory;
  }

  updateTerritory(id: string, updates: Partial<Territory>): Territory | undefined {
    const territory = this.territories.get(id);
    if (territory) {
      const updated = { ...territory, ...updates };
      this.territories.set(id, updated);
      return updated;
    }
    return undefined;
  }

  getChallenges(): Challenge[] {
    return Array.from(this.challenges.values());
  }

  getChallenge(id: string): Challenge | undefined {
    return this.challenges.get(id);
  }

  getChallengesByUser(userId: string): Challenge[] {
    return Array.from(this.challenges.values()).filter(
      c => c.challengerId === userId || c.challengedId === userId
    );
  }

  createChallenge(challenge: Challenge): Challenge {
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  updateChallenge(id: string, updates: Partial<Challenge>): Challenge | undefined {
    const challenge = this.challenges.get(id);
    if (challenge) {
      const updated = { ...challenge, ...updates };
      this.challenges.set(id, updated);
      return updated;
    }
    return undefined;
  }

  getActivities(): Activity[] {
    return Array.from(this.activities.values());
  }

  getActivity(id: string): Activity | undefined {
    return this.activities.get(id);
  }

  getActivitiesByUser(userId: string): Activity[] {
    return Array.from(this.activities.values()).filter(a => a.userId === userId);
  }

  createActivity(activity: Activity): Activity {
    this.activities.set(activity.id, activity);
    return activity;
  }

  getBadges(): Badge[] {
    return Array.from(this.badges.values());
  }

  getBadge(id: string): Badge | undefined {
    return this.badges.get(id);
  }
}

export const db = new InMemoryDatabase();
