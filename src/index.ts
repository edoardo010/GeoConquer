import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌍 GeoConquer API running on port ${PORT}`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🗺️  Territory maps and challenges system active`);
});
