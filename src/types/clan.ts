export interface Clan {
  id: string;
  name: string;
  description: string;
  founderId: string;
  members: string[];
  avatar?: string;
  banner?: string;
  level: number;
  experience: number;
  totalArea: number;
  totalDistance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClanMember {
  userId: string;
  clanId: string;
  role: 'founder' | 'admin' | 'member';
  joinedAt: Date;
  contribution: number;
}

export interface ClanStats {
  membersCount: number;
  totalArea: number;
  totalDistance: number;
  level: number;
  experience: number;
  rank: number;
}
