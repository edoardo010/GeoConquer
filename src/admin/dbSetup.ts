import path from 'path';
import fs from 'fs';
import readline from 'readline';

interface DatabaseConfig {
  type: 'postgres' | 'mongodb' | 'dynamodb' | 'firebase' | 'inmemory';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  url?: string;
  apiKey?: string;
  projectId?: string;
}

interface AdminSetupConfig {
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
  database: DatabaseConfig;
  port: number;
}

export class DatabaseSetupManager {
  private configPath: string;
  private rl: readline.Interface;

  constructor(configPath: string = path.join(process.cwd(), '.env')) {
    this.configPath = configPath;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  private question(query: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(query, resolve);
    });
  }

  private questionHidden(query: string): Promise<string> {
    return new Promise(resolve => {
      const stdin = process.stdin;
      stdin.resume();
      stdin.setRawMode(true);
      stdin.setEncoding('utf8');

      process.stdout.write(query);

      let password = '';
      stdin.on('data', function onData(char: any) {
        const charStr = char.toString();
        if (charStr === '\n' || charStr === '\r' || charStr === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
        } else if (charStr === '\u0003') {
          process.exit();
        } else {
          password += charStr;
        }
      });
    });
  }

  async interactiveSetup(): Promise<AdminSetupConfig> {
    console.log('\n🔧 === GeoConquer - Database Setup Wizard ===\n');
    console.log('Benvenuto nel sistema di configurazione del database.');
    console.log('Questo wizard ti guiderà attraverso la configurazione.\n');

    const adminUsername = await this.question('📝 Username amministratore: ');
    const adminEmail = await this.question('📧 Email amministratore: ');
    const adminPassword = await this.questionHidden('🔐 Password amministratore (non visibile): ');

    console.log('\n🗄️  === Seleziona il tipo di database ===\n');
    console.log('1. PostgreSQL + PostGIS (CONSIGLIATO)');
    console.log('2. MongoDB');
    console.log('3. Firebase/Firestore');
    console.log('4. DynamoDB');
    console.log('5. In-Memory (test/sviluppo)\n');

    let dbChoice = '';
    while (!['1', '2', '3', '4', '5'].includes(dbChoice)) {
      dbChoice = await this.question('Scegli un\'opzione (1-5): ');
    }

    let database: DatabaseConfig;

    switch (dbChoice) {
      case '1':
        database = await this.setupPostgres();
        break;
      case '2':
        database = await this.setupMongoDB();
        break;
      case '3':
        database = await this.setupFirebase();
        break;
      case '4':
        database = await this.setupDynamoDB();
        break;
      case '5':
        database = { type: 'inmemory' };
        break;
      default:
        database = { type: 'inmemory' };
    }

    const portStr = await this.question('🌐 Porta del server (default: 3000): ');
    const port = portStr ? parseInt(portStr) : 3000;

    return {
      adminUsername,
      adminEmail,
      adminPassword,
      database,
      port
    };
  }

  private async setupPostgres(): Promise<DatabaseConfig> {
    console.log('\n📊 === Configurazione PostgreSQL ===\n');

    const host = await this.question('Host (default: localhost): ') || 'localhost';
    const portStr = await this.question('Porta (default: 5432): ') || '5432';
    const port = parseInt(portStr);
    const username = await this.question('Username (default: postgres): ') || 'postgres';
    const password = await this.questionHidden('Password: ');
    const database = await this.question('Nome database (default: geoconquer): ') || 'geoconquer';

    return {
      type: 'postgres',
      host,
      port,
      username,
      password,
      database
    };
  }

  private async setupMongoDB(): Promise<DatabaseConfig> {
    console.log('\n🍃 === Configurazione MongoDB ===\n');

    const useAtlas = await this.question('Usi MongoDB Atlas (cloud)? (s/n, default: s): ') || 's';

    if (useAtlas.toLowerCase() === 's') {
      const url = await this.question('MongoDB Atlas Connection String: ');
      return {
        type: 'mongodb',
        url
      };
    } else {
      const host = await this.question('Host (default: localhost): ') || 'localhost';
      const portStr = await this.question('Porta (default: 27017): ') || '27017';
      const port = parseInt(portStr);
      const username = await this.question('Username (opzionale): ') || '';
      const password = await this.question('Password (opzionale): ') || '';
      const database = await this.question('Nome database (default: geoconquer): ') || 'geoconquer';

      return {
        type: 'mongodb',
        host,
        port,
        username,
        password,
        database,
        url: `mongodb://${username}${password ? ':' + password + '@' : ''}${host}:${port}/${database}`
      };
    }
  }

  private async setupFirebase(): Promise<DatabaseConfig> {
    console.log('\n🔥 === Configurazione Firebase/Firestore ===\n');

    const projectId = await this.question('Firebase Project ID: ');
    const apiKey = await this.question('Firebase API Key: ');

    return {
      type: 'firebase',
      projectId,
      apiKey
    };
  }

  private async setupDynamoDB(): Promise<DatabaseConfig> {
    console.log('\n⚡ === Configurazione DynamoDB ===\n');

    const useAWS = await this.question('Usi AWS (s/n, default: s): ') || 's';

    if (useAWS.toLowerCase() === 's') {
      console.log('DynamoDB sarà configurato tramite AWS credentials di default.');
      return {
        type: 'dynamodb'
      };
    } else {
      const endpoint = await this.question('Endpoint locale (es: http://localhost:8000): ');
      return {
        type: 'dynamodb',
        url: endpoint
      };
    }
  }

  async saveConfiguration(config: AdminSetupConfig): Promise<void> {
    const envContent = this.buildEnvContent(config);

    fs.writeFileSync(this.configPath, envContent);
    console.log(`\n✅ Configurazione salvata in: ${this.configPath}`);
  }

  private buildEnvContent(config: AdminSetupConfig): string {
    let content = `# GeoConquer Environment Configuration\n`;
    content += `# Generato dal Database Setup Wizard\n\n`;

    content += `# Server\n`;
    content += `PORT=${config.port}\n`;
    content += `NODE_ENV=production\n\n`;

    content += `# Admin Account\n`;
    content += `ADMIN_USERNAME=${config.adminUsername}\n`;
    content += `ADMIN_EMAIL=${config.adminEmail}\n`;
    content += `ADMIN_PASSWORD_HASH=${this.hashPassword(config.adminPassword)}\n\n`;

    content += `# Database Configuration\n`;
    content += `DATABASE_TYPE=${config.database.type}\n`;

    switch (config.database.type) {
      case 'postgres':
        content += `DATABASE_HOST=${config.database.host}\n`;
        content += `DATABASE_PORT=${config.database.port}\n`;
        content += `DATABASE_USER=${config.database.username}\n`;
        content += `DATABASE_PASSWORD=${config.database.password}\n`;
        content += `DATABASE_NAME=${config.database.database}\n`;
        content += `DATABASE_URL=postgresql://${config.database.username}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.database}\n`;
        break;

      case 'mongodb':
        content += `MONGODB_URL=${config.database.url}\n`;
        content += `DATABASE_NAME=${config.database.database}\n`;
        break;

      case 'firebase':
        content += `FIREBASE_PROJECT_ID=${config.database.projectId}\n`;
        content += `FIREBASE_API_KEY=${config.database.apiKey}\n`;
        break;

      case 'dynamodb':
        if (config.database.url) {
          content += `DYNAMODB_ENDPOINT=${config.database.url}\n`;
        } else {
          content += `# Using default AWS credentials\n`;
        }
        break;

      case 'inmemory':
        content += `# Using in-memory database (development only)\n`;
        break;
    }

    content += `\n# JWT Secret\n`;
    content += `JWT_SECRET=${this.generateSecret()}\n`;

    content += `\n# Session\n`;
    content += `SESSION_SECRET=${this.generateSecret()}\n`;

    return content;
  }

  private hashPassword(password: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  private generateSecret(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async testConnection(config: DatabaseConfig): Promise<boolean> {
    console.log('\n🧪 Test della connessione al database...\n');

    try {
      switch (config.type) {
        case 'postgres':
          return await this.testPostgresConnection(config);
        case 'mongodb':
          return await this.testMongoDBConnection(config);
        case 'inmemory':
          console.log('✅ Database in-memory - connessione OK');
          return true;
        default:
          console.log('⚠️  Test di connessione non disponibile per questo tipo');
          return true;
      }
    } catch (error) {
      console.error('❌ Errore nella connessione:', error);
      return false;
    }
  }

  private async testPostgresConnection(config: DatabaseConfig): Promise<boolean> {
    const { createConnection } = require('typeorm');

    try {
      const connection = await createConnection({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database
      });

      await connection.close();
      console.log('✅ Connessione PostgreSQL riuscita!');
      return true;
    } catch (error) {
      console.error('❌ Errore PostgreSQL:', error);
      return false;
    }
  }

  private async testMongoDBConnection(config: DatabaseConfig): Promise<boolean> {
    const { MongoClient } = require('mongodb');

    try {
      const client = new MongoClient(config.url);
      await client.connect();
      await client.db('admin').command({ ping: 1 });
      await client.close();
      console.log('✅ Connessione MongoDB riuscita!');
      return true;
    } catch (error) {
      console.error('❌ Errore MongoDB:', error);
      return false;
    }
  }

  close(): void {
    this.rl.close();
  }
}

export async function runDatabaseSetup(): Promise<void> {
  const setupManager = new DatabaseSetupManager();

  try {
    const config = await setupManager.interactiveSetup();

    console.log('\n📋 === Riepilogo Configurazione ===\n');
    console.log(`Admin Username: ${config.adminUsername}`);
    console.log(`Admin Email: ${config.adminEmail}`);
    console.log(`Database Type: ${config.database.type}`);
    console.log(`Server Port: ${config.port}\n`);

    const confirm = await setupManager['question']('Procedere con il salvataggio? (s/n): ');

    if (confirm.toLowerCase() !== 's') {
      console.log('❌ Setup annullato');
      setupManager.close();
      return;
    }

    await setupManager.saveConfiguration(config);

    const testConnection = await setupManager['question'](
      'Testare la connessione al database? (s/n, default: s): '
    ) || 's';

    if (testConnection.toLowerCase() === 's') {
      const isConnected = await setupManager.testConnection(config.database);
      if (!isConnected) {
        console.log('\n⚠️  Attenzione: La connessione al database ha avuto problemi.');
        console.log('Verifica i dati e riprova.');
      }
    }

    console.log('\n✨ === Setup completato! ===\n');
    console.log('Prossimi passi:');
    console.log('1. npm install (se non già fatto)');
    console.log('2. npm run build');
    console.log('3. npm start');
    console.log('\n🌍 Il server sarà disponibile su http://localhost:' + config.port);

    setupManager.close();
  } catch (error) {
    console.error('Errore durante il setup:', error);
    setupManager.close();
    process.exit(1);
  }
}

if (require.main === module) {
  runDatabaseSetup().catch(console.error);
}
