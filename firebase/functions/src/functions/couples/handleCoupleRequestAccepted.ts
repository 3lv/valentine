import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { db, auth } from '../../config/firebase';

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
        await auth.setCustomUserClaims(fromUserId, { coupleId });
        await auth.setCustomUserClaims(toUserId, { coupleId });
      });

      console.log(`Couple document created with id: ${coupleId}`);
      console.log(`Custom claims updated for users ${fromUserId} and ${toUserId}`);
    } catch (error) {
      console.error('Error processing couple request:', error);
    }
  }
);