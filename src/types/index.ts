export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  totalDistance: number;
  level: number;
  experience: number;
  badges: string[];
  createdAt: Date;
}

export interface Territory {
  id: string;
  userId: string;
  coordinates: Coordinates[];
  area: number;
  conqueredAt: Date;
  lastVisited: Date;
  name?: string;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengedId: string;
  territoryId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  targetDistance?: number;
  startDate?: Date;
  endDate?: Date;
  winnerId?: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  userId: string;
  route: Coordinates[];
  distance: number;
  duration: number;
  averageSpeed: number;
  territoriesConquered: string[];
  timestamp: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalArea: number;
  totalDistance: number;
  level: number;
  rank: number;
}
