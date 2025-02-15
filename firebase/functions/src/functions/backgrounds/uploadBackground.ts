/*
gcloud iam service-accounts add-iam-policy-binding project-number-compute@developer.gserviceaccount.com \
  --member="serviceAccount:project-number-compute@developer.gserviceaccount.com" \
  --role="roles/iam.serviceAccountTokenCreator"
*/
import { onRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';

export const uploadBackground = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const apiKey = req.headers['x-api-key'];
  const coupleId = req.headers['x-couple-id'] as string;

  console.log('API Key:', apiKey);
  console.log('Couple ID:', coupleId);

  if (!apiKey || !coupleId) {
    res.status(401).send('API key and couple ID required');
    return;
  }

  try {
    // Get the couple document directly using coupleId
    const coupleDoc = await admin.firestore()
      .collection('couples')
      .doc(coupleId)
      .get();

    if (!coupleDoc.exists) {
      res.status(404).send('Couple not found');
      return;
    }

    const coupleData = coupleDoc.data();
    const hasValidApiKey = coupleData?.apiKeys?.some((key: any) => key.key === apiKey);

    if (!hasValidApiKey) {
      res.status(401).send('Invalid API key for this couple');
      return;
    }

    // Check if image data exists in request body
    if (!req.body?.image) {
      res.status(400).send('Image data required in request body');
      return;
    }

    // Handle image upload
    const imageBuffer = Buffer.from(req.body.image, 'base64');
    console.log('Image Data Length:', req.body.image.length);

    if (!imageBuffer || imageBuffer.length === 0) {
      res.status(400).send('Invalid image data');
      return;
    }

    // Upload image to Firebase Storage
    const bucket = admin.storage().bucket();
    const filename = `couples/${coupleId}/backgrounds/${Date.now()}.jpg`;
    const file = bucket.file(filename);

    console.log('Uploading to Firebase Storage:', filename);

    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    // Get a signed URL that expires far in the future
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '2099-12-31' // Long expiration date
    });

    console.log('Image URL:', downloadUrl);

    // Add the background to the couple's collection
    await admin.firestore()
      .collection('couples')
      .doc(coupleId)
      .collection('backgrounds')
      .add({
        userId: '',
        imageUrl: downloadUrl,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        active: true,
        userEmail: '',
        userName: coupleData?.apiKeys?.find((key: any) => key.key === apiKey)?.name || 'API Upload',
        uploadedVia: 'api'
      });

    console.log('Added document to Firestore:', coupleId);

    // Update the API key's lastUsed timestamp
    const updatedApiKeys = coupleData?.apiKeys?.map((key: any) => {
      if (key.key === apiKey) {
        return { ...key, lastUsed: new Date().toISOString() };
      }
      return key;
    });

    await coupleDoc.ref.update({ apiKeys: updatedApiKeys });

    res.status(200).json({ success: true, imageUrl: downloadUrl });
  } catch (error) {
    console.error('Error processing API request:', error);
    res.status(500).send('Internal Server Error');
  }
});