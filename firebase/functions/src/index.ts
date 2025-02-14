import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Add this new function to create user profiles automatically
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  if (!user) {
    console.log('No user data available');
    return;
  }

  const userProfile = {
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
    photoURL: user.photoURL || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    coupleId: null, // Initialize with no couple
  };

  try {
    await admin.firestore().collection('users').doc(user.uid).set(userProfile);
    console.log(`Created profile for user ${user.uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});

export const handleCoupleRequestAccepted = onDocumentUpdated(
  'coupleRequests/{requestId}',
  async (event) => {
    // Use "before" and "after" properties for the snapshot change
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) {
      console.log('Missing snapshot data');
      return;
    }

    // Only proceed if status changed to "accepted"
    if (beforeData.status === 'accepted' || afterData.status !== 'accepted') {
      console.log('Status did not change to accepted, ignoring...');
      return;
    }

    const {
      fromUserId,
      fromUserEmail,
      fromUserDisplayName,
      toUserId,
      toUserEmail,
      toUserDisplayName,
    } = afterData;

    const db = admin.firestore();
    const coupleRef = db.collection('couples').doc();
    const coupleId = coupleRef.id;
    const coupleName = `${fromUserDisplayName} & ${toUserDisplayName}`;
    const anniversary = new Date().toISOString().split('T')[0];

    try {
      await db.runTransaction(async (transaction) => {
        // Create the couple document
        transaction.set(coupleRef, {
          name: coupleName,
          anniversary,
          members: [
            {
              id: fromUserId,
              email: fromUserEmail,
              displayName: fromUserDisplayName,
            },
            {
              id: toUserId,
              email: toUserEmail,
              displayName: toUserDisplayName,
            },
          ],
        });

        // Update both user profiles with the new coupleId
        const fromUserRef = db.collection('users').doc(fromUserId);
        const toUserRef = db.collection('users').doc(toUserId);

        transaction.update(fromUserRef, { coupleId });
        transaction.update(toUserRef, { coupleId });

        // Set custom claims for both users to include coupleId in their tokens
        await admin.auth().setCustomUserClaims(fromUserId, { coupleId });
        await admin.auth().setCustomUserClaims(toUserId, { coupleId });
      });

      console.log(`Couple document created with id: ${coupleId}`);
      console.log(`Custom claims updated for users ${fromUserId} and ${toUserId}`);
    } catch (error) {
      console.error('Error processing couple request:', error);
    }
  }
);