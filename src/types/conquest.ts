export interface ConquestRecord {
  id: string;
  userId: string;
  username: string;
  territoryName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  }[];
  area: number;
  distance: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  evidenceUrl?: string;
}

export interface ConquestStats {
  pending: number;
  approved: number;
  rejected: number;
  totalArea: number;
}
