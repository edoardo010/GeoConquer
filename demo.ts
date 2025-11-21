import { UserService } from './src/services/userService';
import { TerritoryService } from './src/services/territoryService';
import { ChallengeService } from './src/services/challengeService';
import { Coordinates } from './src/types';

async function runDemo() {
  console.log('🌍 GeoConquer Demo - Territory Maps & Challenges\n');

  const userService = new UserService();
  const territoryService = new TerritoryService();
  const challengeService = new ChallengeService();

  console.log('1️⃣  Creating users...');
  const user1 = await userService.createUser('mario_rossi', 'mario@geoconquer.it');
  const user2 = await userService.createUser('laura_bianchi', 'laura@geoconquer.it');
  console.log(`✅ Created users: ${user1.username}, ${user2.username}\n`);

  console.log('2️⃣  Recording activities and conquering territories...');
  
  const route1: Coordinates[] = [
    { latitude: 45.4642, longitude: 9.1900 },
    { latitude: 45.4652, longitude: 9.1910 },
    { latitude: 45.4662, longitude: 9.1920 },
    { latitude: 45.4672, longitude: 9.1930 }
  ];
  
  const activity1 = await territoryService.recordActivity(user1.id, route1, 1800);
  console.log(`✅ ${user1.username} completed activity: ${Math.round(activity1.distance)}m in ${activity1.duration}s`);

  const route2: Coordinates[] = [
    { latitude: 45.4700, longitude: 9.2000 },
    { latitude: 45.4710, longitude: 9.2010 },
    { latitude: 45.4720, longitude: 9.2020 }
  ];
  
  const activity2 = await territoryService.recordActivity(user2.id, route2, 1200);
  console.log(`✅ ${user2.username} completed activity: ${Math.round(activity2.distance)}m in ${activity2.duration}s\n`);

  console.log('3️⃣  Checking territories...');
  const user1Territories = await territoryService.getUserTerritories(user1.id);
  const user2Territories = await territoryService.getUserTerritories(user2.id);
  const user1Area = await territoryService.getTotalUserArea(user1.id);
  const user2Area = await territoryService.getTotalUserArea(user2.id);
  
  console.log(`✅ ${user1.username}: ${user1Territories.length} territories, ${Math.round(user1Area)}m² total area`);
  console.log(`✅ ${user2.username}: ${user2Territories.length} territories, ${Math.round(user2Area)}m² total area\n`);

  console.log('4️⃣  Creating challenge...');
  const challenge = await challengeService.createChallenge(
    user1.id,
    user2.id,
    user1Territories[0].id,
    5000
  );
  console.log(`✅ Challenge created: ${user1.username} vs ${user2.username}`);
  console.log(`   Status: ${challenge.status}\n`);

  console.log('5️⃣  Accepting challenge...');
  const acceptedChallenge = await challengeService.acceptChallenge(challenge.id);
  console.log(`✅ Challenge accepted! Status: ${acceptedChallenge.status}\n`);

  console.log('6️⃣  Checking user stats...');
  const stats1 = await userService.getUserStats(user1.id);
  console.log(`✅ ${user1.username} Stats:`);
  console.log(`   Level: ${stats1.stats.level}`);
  console.log(`   Experience: ${stats1.stats.experience}`);
  console.log(`   Badges: ${stats1.stats.badges.join(', ') || 'None yet'}`);
  console.log(`   Total distance: ${Math.round(stats1.stats.totalDistance)}m\n`);

  console.log('7️⃣  Checking leaderboard...');
  const leaderboard = await userService.getLeaderboard();
  console.log('🏆 Top Users:');
  leaderboard.forEach(entry => {
    console.log(`   ${entry.rank}. ${entry.username} - ${Math.round(entry.totalArea)}m² (Level ${entry.level})`);
  });

  console.log('\n✨ Demo completed successfully!');
  console.log('📍 Visit http://localhost:3000 for the API');
  console.log('🗺️  Visit the public/index.html for the interactive map demo\n');
}

runDemo().catch(console.error);
