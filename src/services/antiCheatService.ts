import { v4 as uuidv4 } from 'uuid';
import { TerritoryConquest, UserBan, AntiCheatConfig } from '../types/territory';
import { dataService } from './dataService';

export class AntiCheatService {
  private bans: Map<string, UserBan> = new Map();
  private config: AntiCheatConfig = {
    maxSpeedKmh: 60,      // Velocità massima ragionevole a piedi
    minSpeedKmh: 0.5,     // Velocità minima (più lento è impossibile)
    maxDistanceKm: 50,    // 50 km max in una conquista
    minDistanceM: 50      // 50 metri minimo
  };

  constructor() {
    this.loadBans();
  }

  private loadBans(): void {
    const data = dataService.readData('bans.json', {});
    this.bans = new Map(Object.entries(data));
  }

  private saveBans(): void {
    const data = Object.fromEntries(this.bans);
    dataService.writeData('bans.json', data);
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

  // Valida una conquista territoriale
  validateConquest(conquest: TerritoryConquest): {
    isValid: boolean;
    reason?: string;
    speed?: number;
  } {
    const distance = conquest.distance; // km
    const durationHours = conquest.duration / 60; // converti minuti in ore
    const calculatedSpeed = distance / durationHours; // km/h

    // Controlla distanza minima
    if (distance < this.config.minDistanceM / 1000) {
      return {
        isValid: false,
        reason: `Distanza troppo breve (${(distance * 1000).toFixed(0)}m < ${this.config.minDistanceM}m)`
      };
    }

    // Controlla distanza massima
    if (distance > this.config.maxDistanceKm) {
      return {
        isValid: false,
        reason: `Distanza troppo lunga (${distance.toFixed(1)}km > ${this.config.maxDistanceKm}km)`
      };
    }

    // Controlla velocità minima
    if (calculatedSpeed < this.config.minSpeedKmh) {
      return {
        isValid: false,
        reason: `Velocità troppo bassa (${calculatedSpeed.toFixed(1)}km/h < ${this.config.minSpeedKmh}km/h) - è possibile che hai barato`,
        speed: calculatedSpeed
      };
    }

    // Controlla velocità massima (ANTI-CHEAT PRINCIPALE)
    if (calculatedSpeed > this.config.maxSpeedKmh) {
      return {
        isValid: false,
        reason: `CHEAT RILEVATO: Velocità impossibile (${calculatedSpeed.toFixed(1)}km/h > ${this.config.maxSpeedKmh}km/h) - Ban di 1 giorno applicato`,
        speed: calculatedSpeed
      };
    }

    return {
      isValid: true,
      speed: calculatedSpeed
    };
  }

  // Applica ban a utente
  banUser(userId: string, username: string, reason: string): UserBan {
    const id = uuidv4();
    const now = new Date();
    const unbannedAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ore dopo

    const ban: UserBan = {
      id,
      userId,
      username,
      reason,
      bannedAt: now,
      unbannedAt,
      active: true
    };

    this.bans.set(userId, ban);
    this.saveBans();

    return ban;
  }

  // Controlla se utente è bannato
  isUserBanned(userId: string): boolean {
    const ban = this.bans.get(userId);
    if (!ban) return false;

    const now = new Date();
    if (now >= ban.unbannedAt) {
      // Ban scaduto, rimuovi
      ban.active = false;
      this.saveBans();
      return false;
    }

    return ban.active;
  }

  // Ottieni info ban
  getBanInfo(userId: string): UserBan | undefined {
    const ban = this.bans.get(userId);
    if (!ban || !ban.active) return undefined;

    const now = new Date();
    if (now >= ban.unbannedAt) {
      ban.active = false;
      this.saveBans();
      return undefined;
    }

    return ban;
  }

  // Ottieni tempo rimanente ban in secondi
  getBanTimeRemaining(userId: string): number {
    const ban = this.getBanInfo(userId);
    if (!ban) return 0;

    const remaining = ban.unbannedAt.getTime() - new Date().getTime();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  // Ottieni tutti i ban attivi
  getActiveBans(): UserBan[] {
    return Array.from(this.bans.values()).filter(ban => {
      if (!ban.active) return false;
      if (new Date() >= ban.unbannedAt) {
        ban.active = false;
        return false;
      }
      return true;
    });
  }

  // Rimuovi ban manualmente (da admin)
  removeBan(userId: string): boolean {
    const ban = this.bans.get(userId);
    if (!ban) return false;

    ban.active = false;
    this.saveBans();
    return true;
  }

  // Aggiorna config anti-cheat
  updateConfig(newConfig: Partial<AntiCheatConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Ottieni config
  getConfig(): AntiCheatConfig {
    return this.config;
  }

  // Pulisci ban scaduti
  cleanupExpiredBans(): number {
    let count = 0;
    const now = new Date();

    this.bans.forEach((ban, userId) => {
      if (now >= ban.unbannedAt) {
        this.bans.delete(userId);
        count++;
      }
    });

    if (count > 0) {
      this.saveBans();
    }

    return count;
  }
}

export const antiCheatService = new AntiCheatService();
