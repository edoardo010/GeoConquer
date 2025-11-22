import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function runDemo() {
  console.log('🌍 GeoConquer Demo - Territory Conquest System\n');

  try {
    // 1. Crea utenti
    console.log('1️⃣  Registering users...');
    const user1Reg = await axios.post(`${API_URL}/auth/register`, {
      username: 'mario_demo',
      email: 'mario@demo.geoconquer.it',
      password: 'DemoPass123!',
      confirmPassword: 'DemoPass123!'
    });
    const user1 = user1Reg.data.user;
    const token1 = user1Reg.data.token;

    const user2Reg = await axios.post(`${API_URL}/auth/register`, {
      username: 'laura_demo',
      email: 'laura@demo.geoconquer.it',
      password: 'DemoPass123!',
      confirmPassword: 'DemoPass123!'
    });
    const user2 = user2Reg.data.user;
    const token2 = user2Reg.data.token;

    console.log(`✅ Created users: ${user1.username}, ${user2.username}\n`);

    // 2. Registra attività
    console.log('2️⃣  Logging activities...');
    const activity1 = await axios.post(`${API_URL}/activities`, {
      type: 'running',
      title: 'Corsa mattutina Demo',
      distance: 5.5,
      duration: 45,
      calories: 350,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 1.25 * 60 * 60 * 1000).toISOString(),
      coordinates: [{ latitude: 45.4642, longitude: 9.1900 }],
      avgSpeed: 7.3,
      maxSpeed: 9.5,
      description: 'Attività demo registrata dal sistema'
    }, {
      headers: { 'user-id': user1.id }
    });
    console.log(`✅ ${user1.username} registered activity: ${activity1.data.activity.distance} km`);

    const activity2 = await axios.post(`${API_URL}/activities`, {
      type: 'cycling',
      title: 'Gita in bicicletta Demo',
      distance: 15.3,
      duration: 60,
      calories: 600,
      startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      coordinates: [{ latitude: 45.4700, longitude: 9.2000 }],
      avgSpeed: 15.3,
      maxSpeed: 25.0,
      description: 'Gita demo'
    }, {
      headers: { 'user-id': user2.id }
    });
    console.log(`✅ ${user2.username} registered activity: ${activity2.data.activity.distance} km\n`);

    // 3. Crea clan
    console.log('3️⃣  Creating clan...');
    const clanRes = await axios.post(`${API_URL}/clans`, {
      name: 'Demo Warriors',
      description: 'Il clan dei conquistatori demo'
    }, {
      headers: { 'user-id': user1.id }
    });
    const clan = clanRes.data.clan;
    console.log(`✅ Clan created: ${clan.name} (${clan.membersCount} members)\n`);

    // 4. Utente 2 aderisce al clan
    console.log('4️⃣  Joining clan...');
    await axios.post(`${API_URL}/clans/${clan.id}/join`, {}, {
      headers: { 'user-id': user2.id }
    });
    console.log(`✅ ${user2.username} joined clan ${clan.name}\n`);

    // 5. Crea territorio conquest (VALIDO)
    console.log('5️⃣  Creating territory conquest (valid)...');
    const conquestValid = await axios.post(`${API_URL}/territory-conquests`, {
      startLat: 45.4831,
      startLon: 9.1747,
      endLat: 45.5,
      endLon: 9.2,
      durationMinutes: 45
    }, {
      headers: { 'user-id': user1.id }
    });
    console.log(`✅ Conquest created: ${conquestValid.data.conquest.distance.toFixed(2)} km in ${conquestValid.data.conquest.duration} min`);
    console.log(`   Speed: ${conquestValid.data.conquest.calculatedSpeed.toFixed(1)} km/h (Valid: ${!conquestValid.data.conquest.cheatDetected})\n`);

    // 6. Tenta cheat
    console.log('6️⃣  Testing anti-cheat (trying to cheat)...');
    try {
      const conquestCheat = await axios.post(`${API_URL}/territory-conquests`, {
        startLat: 45.4831,
        startLon: 9.1747,
        endLat: 45.5,
        endLon: 9.2,
        durationMinutes: 1  // Troppo veloce!
      }, {
        headers: { 'user-id': user2.id }
      });
    } catch (error: any) {
      console.log(`✅ Cheat blocked! Error: ${error.response.data.error}`);
      console.log(`   Ban status: ${error.response.data.banned ? 'BANNED' : 'NOT BANNED'}\n`);
    }

    // 7. Verifica ban
    console.log('7️⃣  Checking ban status...');
    const banStatus = await axios.get(`${API_URL}/territory-conquests/my/ban-status`, {
      headers: { 'user-id': user2.id }
    });
    console.log(`✅ Ban status: ${banStatus.data.banned ? 'BANNED' : 'NOT BANNED'}`);
    if (banStatus.data.banInfo) {
      console.log(`   Reason: ${banStatus.data.banInfo.reason}`);
      console.log(`   Time remaining: ${banStatus.data.timeRemaining} seconds\n`);
    } else {
      console.log('');
    }

    // 8. Visualizza classifica attività
    console.log('8️⃣  Checking leaderboard...');
    const leaderboard = await axios.get(`${API_URL}/users/leaderboard`);
    console.log('🏆 Top Users:');
    leaderboard.data.slice(0, 5).forEach((entry: any) => {
      console.log(`   ${entry.rank}. ${entry.username} - Level ${entry.level}`);
    });
    console.log('');

    // 9. Classifica clan
    console.log('9️⃣  Checking clan leaderboard...');
    const clanLeaderboard = await axios.get(`${API_URL}/clans/leaderboard`);
    console.log('🏆 Top Clans:');
    clanLeaderboard.data.slice(0, 3).forEach((c: any) => {
      console.log(`   ${c.rank}. ${c.name} - ${c.membersCount} members`);
    });
    console.log('');

    // 10. Admin vede conquiste flaggate
    console.log('🔟 Admin checking flagged conquests...');
    const flagged = await axios.get(`${API_URL}/territory-conquests/admin/flagged`, {
      headers: { 'admin-id': 'admin-demo' }
    });
    console.log(`✅ Flagged conquests: ${flagged.data.count}`);
    console.log(`   Cheaters banned: ${flagged.data.count > 0 ? 'YES' : 'NO'}\n`);

    console.log('✨ Demo completed successfully!');
    console.log('📍 API: http://localhost:3000/api');
    console.log('🗺️  Web: http://localhost:3000');
    console.log('👨‍💼 Admin: http://localhost:3000/admin.html\n');
    
  } catch (error: any) {
    console.error('❌ Demo error:', error.response?.data || error.message);
  }
}

runDemo();
