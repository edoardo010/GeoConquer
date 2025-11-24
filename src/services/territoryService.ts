import { v4 as uuidv4 } from 'uuid';
import { TerritoryConquest } from '../types/territory';
import { dataService } from './dataService';
import { antiCheatService } from './antiCheatService';

export class TerritoryService {
  private conquests: Map<string, TerritoryConquest> = new Map();
  private userConquests: Map<string, string[]> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    const data = dataService.readData('territories.json', {});
    this.conquests = new Map(Object.entries(data));

    this.userConquests.clear();
    this.conquests.forEach(conquest => {
      if (!this.userConquests.has(conquest.userId)) {
        this.userConquests.set(conquest.userId, []);
      }
      this.userConquests.get(conquest.userId)!.push(conquest.id);
    });
  }

  private saveToDisk(): void {
    const data = Object.fromEntries(this.conquests);
    dataService.writeData('territories.json', data);
  }

  // Crea una nuova conquista territoriale
  async createTerritoryConquest(
    userId: string,
    username: string,
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    durationMinutes: number,
    allPoints?: any[]
  ): Promise<{
    success: boolean;
    conquest?: TerritoryConquest;
    error?: string;
    banned?: boolean;
    banTimeRemaining?: number;
  }> {
    // Controlla se utente è bannato
    if (antiCheatService.isUserBanned(userId)) {
      const banInfo = antiCheatService.getBanInfo(userId);
      return {
        success: false,
        error: `Utente bannato. Motivo: ${banInfo?.reason}`,
        banned: true,
        banTimeRemaining: antiCheatService.getBanTimeRemaining(userId)
      };
    }

    // Calcola distanza (haversine formula)
    const distance = this.calculateDistance(startLat, startLon, endLat, endLon);

    // Crea oggetto conquista
    const conquest: TerritoryConquest = {
      id: uuidv4(),
      userId,
      username,
      startPoint: { latitude: startLat, longitude: startLon },
      endPoint: { latitude: endLat, longitude: endLon },
      distance,
      duration: durationMinutes,
      calculatedSpeed: distance / (durationMinutes / 60),
      status: 'pending',
      cheatDetected: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Valida la conquista (anti-cheat)
    const validation = antiCheatService.validateConquest(conquest);

    if (!validation.isValid) {
      conquest.status = 'flagged_cheat';
      conquest.cheatDetected = true;
      conquest.reason = validation.reason;

      // Se velocità impossibile, applica ban
      if (
        validation.speed &&
        validation.speed > antiCheatService.getConfig().maxSpeedKmh
      ) {
        const ban = antiCheatService.banUser(
          userId,
          username,
          `Tentativo di cheat: velocità impossibile (${validation.speed.toFixed(1)}km/h)`
        );

        this.conquests.set(conquest.id, conquest);
        if (!this.userConquests.has(userId)) {
          this.userConquests.set(userId, []);
        }
        this.userConquests.get(userId)!.push(conquest.id);
        this.saveToDisk();

        return {
          success: false,
          error: `CHEAT RILEVATO! ${validation.reason}`,
          banned: true,
          banTimeRemaining: 24 * 60 * 60 // 24 ore in secondi
        };
      }

      // Se altre violazioni, scarta senza ban
      this.conquests.set(conquest.id, conquest);
      if (!this.userConquests.has(userId)) {
        this.userConquests.set(userId, []);
      }
      this.userConquests.get(userId)!.push(conquest.id);
      this.saveToDisk();

      return {
        success: false,
        error: validation.reason
      };
    }

    // Conquista valida, salva come pending
    conquest.status = 'pending';
    this.conquests.set(conquest.id, conquest);

    if (!this.userConquests.has(userId)) {
      this.userConquests.set(userId, []);
    }
    this.userConquests.get(userId)!.push(conquest.id);
    this.saveToDisk();

    return {
      success: true,
      conquest
    };
  }

  // Calcola distanza tra due punti (formula Haversine) in km
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Raggio della Terra in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distanza in km
  }

  // Ottieni conquista per ID
  async getConquestById(id: string): Promise<TerritoryConquest | undefined> {
    return this.conquests.get(id);
  }

  // Ottieni conquiste di un utente
  async getUserConquests(userId: string): Promise<TerritoryConquest[]> {
    const ids = this.userConquests.get(userId) || [];
    return ids
      .map(id => this.conquests.get(id))
      .filter((c): c is TerritoryConquest => !!c)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Ottieni tutte le conquiste pending (da approvare)
  async getPendingConquests(): Promise<TerritoryConquest[]> {
    return Array.from(this.conquests.values())
      .filter(c => c.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Ottieni tutte le conquiste con cheat rilevato
  async getFlaggedConquests(): Promise<TerritoryConquest[]> {
    return Array.from(this.conquests.values())
      .filter(c => c.status === 'flagged_cheat')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Admin approva conquista
  async approveConquest(id: string, adminId: string): Promise<TerritoryConquest | undefined> {
    const conquest = this.conquests.get(id);
    if (!conquest) return undefined;

    conquest.status = 'approved';
    conquest.approvedAt = new Date();
    conquest.approvedBy = adminId;
    conquest.updatedAt = new Date();

    this.saveToDisk();
    return conquest;
  }

  // Admin rifiuta conquista
  async rejectConquest(
    id: string,
    adminId: string,
    reason: string
  ): Promise<TerritoryConquest | undefined> {
    const conquest = this.conquests.get(id);
    if (!conquest) return undefined;

    conquest.status = 'rejected';
    conquest.rejectionReason = reason;
    conquest.approvedAt = new Date();
    conquest.approvedBy = adminId;
    conquest.updatedAt = new Date();

    this.saveToDisk();
    return conquest;
  }

  // Ottieni statistiche
  async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
    totalDistance: number;
  }> {
    const all = Array.from(this.conquests.values());

    return {
      total: all.length,
      pending: all.filter(c => c.status === 'pending').length,
      approved: all.filter(c => c.status === 'approved').length,
      rejected: all.filter(c => c.status === 'rejected').length,
      flagged: all.filter(c => c.status === 'flagged_cheat').length,
      totalDistance: all
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.distance, 0)
    };
  }
}

export const territoryService = new TerritoryService();
