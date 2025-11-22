export interface TerritoryConquest {
  id: string;
  userId: string;
  username: string;
  startPoint: {
    latitude: number;
    longitude: number;
  };
  endPoint: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  duration: number;
  calculatedSpeed: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged_cheat';
  cheatDetected: boolean;
  reason?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBan {
  id: string;
  userId: string;
  username: string;
  reason: string;
  bannedAt: Date;
  unbannedAt: Date;
  active: boolean;
}

export interface AntiCheatConfig {
  maxSpeedKmh: number;
  minSpeedKmh: number;
  maxDistanceKm: number;
  minDistanceM: number;
}
