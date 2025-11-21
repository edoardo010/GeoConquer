import express from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes';
import territoryRoutes from './routes/territoryRoutes';
import challengeRoutes from './routes/challengeRoutes';
import { db } from './models/database';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.json({
    name: 'GeoConquer API',
    version: '1.0.0',
    description: 'API per l\'app di conquista territoriale GeoConquer',
    endpoints: {
      users: '/api/users',
      territories: '/api/territories',
      challenges: '/api/challenges',
      badges: '/api/badges'
    }
  });
});

app.get('/api/badges', (req, res) => {
  const badges = db.getBadges();
  res.json(badges);
});

app.use('/api/users', userRoutes);
app.use('/api/territories', territoryRoutes);
app.use('/api/challenges', challengeRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

export default app;
