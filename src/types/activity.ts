export interface Activity {
  id: string;
  userId: string;
  username: string;
  type: 'running' | 'walking' | 'cycling' | 'hiking';
  title: string;
  description?: string;
  distance: number;
  duration: number;
  calories: number;
  startTime: Date;
  endTime: Date;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  avgSpeed: number;
  maxSpeed: number;
  elevation: number;
  weather?: string;
  temperature?: number;
  imageUrl?: string;
  loggedBy: 'user' | 'admin';
  loggedByAdmin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityStats {
  totalActivities: number;
  totalDistance: number;
  totalDuration: number;
  totalCalories: number;
  averageSpeed: number;
  favoriteType: string;
  activitiesByType: {
    running: number;
    walking: number;
    cycling: number;
    hiking: number;
  };
}

export interface ActivityFilter {
  userId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  minDistance?: number;
  maxDistance?: number;
  loggedBy?: 'user' | 'admin';
}
