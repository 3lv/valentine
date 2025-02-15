import * as functions from 'firebase-functions';
import { db } from '../../config/firebase';
import * as admin from 'firebase-admin';

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
    coupleId: null,
  };

  try {
    await db.collection('users').doc(user.uid).set(userProfile);
    console.log(`Created profile for user ${user.uid}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
});
