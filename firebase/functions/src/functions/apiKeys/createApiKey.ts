import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { createHash } from 'crypto';
import { db } from '../../config/firebase';
import { DocumentReference, DocumentData } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

export const createApiKey = onDocumentCreated(
  'couples/{coupleId}/pendingApiKeys/{requestId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const coupleId = event.params.coupleId;
    const { name, requestedBy } = data;

    // Generate a secure API key
    const key = createHash('sha256')
      .update(coupleId + Date.now().toString())
      .digest('hex');

    const keyId = createHash('md5').update(key).digest('hex');

    const apiKey = {
      id: keyId,
      name,
      key,
      createdAt: new Date().toISOString(),
      createdBy: requestedBy,
    };

    const batch = db.batch();

    // Store the API key in its own document
    const apiKeyRef = db.collection('couples').doc(coupleId).collection('apiKeys').doc(keyId);
    batch.set(apiKeyRef, apiKey);

    // Also store a reference in the couple document for quick validation
    const coupleRef = db.collection('couples').doc(coupleId);
    batch.update(coupleRef, {
      apiKeys: admin.firestore.FieldValue.arrayUnion({ id: keyId, key, name })
    });

    // Delete the pending request
    batch.delete(event.data?.ref as DocumentReference<DocumentData>);

    await batch.commit();
  }
);
