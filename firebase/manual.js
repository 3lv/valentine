const admin = require('firebase-admin');


const serviceAccount = require('./valentine-b-firebase-adminsdk-fbsvc-7c86f5124b.json'); // update the path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace these with your existing user UIDs and the desired coupleId
const fromUserId = 'G3Lq5XVurLYk3UwYl5SakPNGHwA2';
const toUserId = 'It4PJojo9sUiKItig1DgXq7Ez0I3';
const coupleId = 'OANEoyIKLJwUhstDzH0c';

async function setClaims() {
  try {
    await admin.auth().setCustomUserClaims(fromUserId, { coupleId });
    console.log(`Custom claim set for user ${fromUserId}`);
    
    await admin.auth().setCustomUserClaims(toUserId, { coupleId });
    console.log(`Custom claim set for user ${toUserId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    process.exit(1);
  }
}

setClaims();