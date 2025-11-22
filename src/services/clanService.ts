import { v4 as uuidv4 } from 'uuid';
import { Clan, ClanMember, ClanStats } from '../types/clan';
import { db } from '../models/database';

export class ClanService {
  private clans: Map<string, Clan> = new Map();
  private clanMembers: Map<string, ClanMember[]> = new Map();

  async createClan(
    name: string,
    description: string,
    founderId: string,
    avatar?: string,
    banner?: string
  ): Promise<Clan> {
    const existing = Array.from(this.clans.values()).find(c => c.name === name);
    if (existing) {
      throw new Error('Clan name already exists');
    }

    const clanId = uuidv4();
    const clan: Clan = {
      id: clanId,
      name,
      description,
      founderId,
      members: [founderId],
      avatar,
      banner,
      level: 1,
      experience: 0,
      totalArea: 0,
      totalDistance: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.clans.set(clanId, clan);
    this.clanMembers.set(clanId, [
      {
        userId: founderId,
        clanId,
        role: 'founder',
        joinedAt: new Date(),
        contribution: 0
      }
    ]);

    return clan;
  }

  async getClan(id: string): Promise<Clan | undefined> {
    return this.clans.get(id);
  }

  async getClanByName(name: string): Promise<Clan | undefined> {
    return Array.from(this.clans.values()).find(c => c.name === name);
  }

  async getAllClans(): Promise<Clan[]> {
    return Array.from(this.clans.values()).sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.experience - a.experience;
    });
  }

  async getUserClans(userId: string): Promise<Clan[]> {
    return Array.from(this.clans.values()).filter(c => c.members.includes(userId));
  }

  async joinClan(clanId: string, userId: string): Promise<Clan> {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new Error('Clan not found');
    }

    if (clan.members.includes(userId)) {
      throw new Error('User already in clan');
    }

    clan.members.push(userId);
    clan.updatedAt = new Date();

    const members = this.clanMembers.get(clanId) || [];
    members.push({
      userId,
      clanId,
      role: 'member',
      joinedAt: new Date(),
      contribution: 0
    });
    this.clanMembers.set(clanId, members);

    return clan;
  }

  async leaveClan(clanId: string, userId: string): Promise<void> {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new Error('Clan not found');
    }

    if (clan.founderId === userId) {
      throw new Error('Founder cannot leave clan');
    }

    clan.members = clan.members.filter(m => m !== userId);
    clan.updatedAt = new Date();

    const members = this.clanMembers.get(clanId) || [];
    this.clanMembers.set(
      clanId,
      members.filter(m => m.userId !== userId)
    );
  }

  async getClanMembers(clanId: string): Promise<ClanMember[]> {
    return this.clanMembers.get(clanId) || [];
  }

  async getClanStats(clanId: string): Promise<ClanStats> {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new Error('Clan not found');
    }

    const allClans = await this.getAllClans();
    const rank = allClans.findIndex(c => c.id === clanId) + 1;

    return {
      membersCount: clan.members.length,
      totalArea: clan.totalArea,
      totalDistance: clan.totalDistance,
      level: clan.level,
      experience: clan.experience,
      rank
    };
  }

  async updateClanStats(clanId: string, userId: string, contribution: number): Promise<void> {
    const clan = this.clans.get(clanId);
    if (!clan) return;

    clan.experience += contribution;
    clan.totalDistance += contribution;

    const level = Math.floor(Math.sqrt(clan.experience / 100)) + 1;
    clan.level = Math.max(clan.level, level);
    clan.updatedAt = new Date();

    const members = this.clanMembers.get(clanId) || [];
    const member = members.find(m => m.userId === userId);
    if (member) {
      member.contribution += contribution;
    }
  }

  async deleteClan(clanId: string, userId: string): Promise<void> {
    const clan = this.clans.get(clanId);
    if (!clan) {
      throw new Error('Clan not found');
    }

    if (clan.founderId !== userId) {
      throw new Error('Only founder can delete clan');
    }

    this.clans.delete(clanId);
    this.clanMembers.delete(clanId);
  }

  async getClanLeaderboard(clanId: string, limit: number = 10): Promise<Array<{ userId: string; contribution: number; role: string }>> {
    const members = this.clanMembers.get(clanId) || [];
    return members
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, limit)
      .map(m => ({
        userId: m.userId,
        contribution: m.contribution,
        role: m.role
      }));
  }

  getGlobalLeaderboard(limit: number = 100): Array<{
    id: string;
    name: string;
    level: number;
    experience: number;
    totalArea: number;
    totalDistance: number;
    membersCount: number;
    rank: number;
  }> {
    const clans = Array.from(this.clans.values()).sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.experience - a.experience;
    });

    return clans.slice(0, limit).map((clan, index) => ({
      id: clan.id,
      name: clan.name,
      level: clan.level,
      experience: clan.experience,
      totalArea: clan.totalArea,
      totalDistance: clan.totalDistance,
      membersCount: clan.members.length,
      rank: index + 1
    }));
  }
}

export const clanService = new ClanService();
