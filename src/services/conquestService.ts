import { v4 as uuidv4 } from 'uuid';
import { ConquestRecord, ConquestStats } from '../types/conquest';

export class ConquestService {
  private conquests: Map<string, ConquestRecord> = new Map();
  private userConquests: Map<string, string[]> = new Map();

  async createConquestRecord(
    userId: string,
    username: string,
    territoryName: string,
    coordinates: any[],
    area: number,
    distance: number,
    description: string,
    evidenceUrl?: string
  ): Promise<ConquestRecord> {
    const id = uuidv4();
    const conquest: ConquestRecord = {
      id,
      userId,
      username,
      territoryName,
      coordinates,
      area,
      distance,
      description,
      status: 'pending',
      createdAt: new Date(),
      evidenceUrl
    };

    this.conquests.set(id, conquest);

    if (!this.userConquests.has(userId)) {
      this.userConquests.set(userId, []);
    }
    this.userConquests.get(userId)!.push(id);

    return conquest;
  }

  async getPendingConquests(): Promise<ConquestRecord[]> {
    return Array.from(this.conquests.values())
      .filter(c => c.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllConquests(limit: number = 100): Promise<ConquestRecord[]> {
    return Array.from(this.conquests.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUserConquests(userId: string): Promise<ConquestRecord[]> {
    const conquestIds = this.userConquests.get(userId) || [];
    return conquestIds
      .map(id => this.conquests.get(id))
      .filter((c): c is ConquestRecord => !!c)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getConquestById(id: string): Promise<ConquestRecord | undefined> {
    return this.conquests.get(id);
  }

  async approveConquest(id: string, adminId: string): Promise<ConquestRecord | undefined> {
    const conquest = this.conquests.get(id);
    if (!conquest) return undefined;

    conquest.status = 'approved';
    conquest.approvedAt = new Date();
    conquest.approvedBy = adminId;

    return conquest;
  }

  async rejectConquest(id: string, adminId: string, reason: string): Promise<ConquestRecord | undefined> {
    const conquest = this.conquests.get(id);
    if (!conquest) return undefined;

    conquest.status = 'rejected';
    conquest.rejectionReason = reason;
    conquest.approvedAt = new Date();
    conquest.approvedBy = adminId;

    return conquest;
  }

  async getStats(): Promise<ConquestStats> {
    const conquests = Array.from(this.conquests.values());

    return {
      pending: conquests.filter(c => c.status === 'pending').length,
      approved: conquests.filter(c => c.status === 'approved').length,
      rejected: conquests.filter(c => c.status === 'rejected').length,
      totalArea: conquests
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.area, 0)
    };
  }

  async getConquestsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<ConquestRecord[]> {
    return Array.from(this.conquests.values())
      .filter(c => c.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const conquestService = new ConquestService();
