import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Assicurati che la cartella data esista
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class DataService {
  private dataDir: string;

  constructor() {
    this.dataDir = DATA_DIR;
    ensureDataDir();
  }

  // Leggi dati da file
  readData<T>(filename: string, defaultValue: T): T {
    const filePath = path.join(this.dataDir, filename);
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(`Errore lettura ${filename}:`, error);
    }
    return defaultValue;
  }

  // Scrivi dati su file
  writeData<T>(filename: string, data: T): void {
    const filePath = path.join(this.dataDir, filename);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Errore scrittura ${filename}:`, error);
    }
  }

  // Leggi tutti i dati
  readAllData(): {
    users: any;
    activities: any;
    conquests: any;
    clans: any;
  } {
    return {
      users: this.readData('users.json', {}),
      activities: this.readData('activities.json', {}),
      conquests: this.readData('conquests.json', {}),
      clans: this.readData('clans.json', {})
    };
  }

  // Salva tutto
  saveAll(users: any, activities: any, conquests: any, clans: any): void {
    this.writeData('users.json', users);
    this.writeData('activities.json', activities);
    this.writeData('conquests.json', conquests);
    this.writeData('clans.json', clans);
  }

  // Backup dati
  createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.dataDir, 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = ['users.json', 'activities.json', 'conquests.json', 'clans.json'];
    files.forEach(file => {
      const source = path.join(this.dataDir, file);
      const dest = path.join(backupDir, `${file}.${timestamp}`);
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
      }
    });

    return `Backup creato: ${timestamp}`;
  }

  // Ottieni statistiche
  getDataStats(): {
    usersCount: number;
    activitiesCount: number;
    conquestsCount: number;
    clansCount: number;
    totalSize: string;
  } {
    let totalBytes = 0;
    const files = ['users.json', 'activities.json', 'conquests.json', 'clans.json'];

    const data = this.readAllData();

    files.forEach(file => {
      const filePath = path.join(this.dataDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        totalBytes += stats.size;
      }
    });

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return {
      usersCount: Object.keys(data.users).length,
      activitiesCount: Object.keys(data.activities).length,
      conquestsCount: Object.keys(data.conquests).length,
      clansCount: Object.keys(data.clans).length,
      totalSize: formatBytes(totalBytes)
    };
  }

  // Pulisci dati (cancella tutto)
  clearAllData(): void {
    const files = ['users.json', 'activities.json', 'conquests.json', 'clans.json'];
    files.forEach(file => {
      const filePath = path.join(this.dataDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  // Ottieni percorso dati
  getDataPath(): string {
    return this.dataDir;
  }
}

export const dataService = new DataService();
