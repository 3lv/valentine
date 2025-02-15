import { onRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';

export const uploadBackground = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const apiKey = req.headers['x-api-key'];
  const coupleId = req.headers['x-couple-id'] as string;

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

    // Handle image upload
    const imageBuffer = Buffer.from(req.body.image, 'base64');
    if (!imageBuffer) {
      res.status(400).send('Image data required');
      return;
    }

    // Upload image to Firebase Storage
    const bucket = admin.storage().bucket();
    const filename = `backgrounds/${coupleId}/${Date.now()}.jpg`;
    const file = bucket.file(filename);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg'
      }
    });

    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });

    // Add the background to the couple's collection
    await admin.firestore()
      .collection('couples')
      .doc(coupleId)
      .collection('backgrounds')
      .add({
        imageUrl: url,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        uploadedVia: 'api',
        active: true,
      });

    // Update the API key's lastUsed timestamp
    const updatedApiKeys = coupleData?.apiKeys?.map((key: any) => {
      if (key.key === apiKey) {
        return { ...key, lastUsed: new Date().toISOString() };
      }
      return key;
    });

    await coupleDoc.ref.update({ apiKeys: updatedApiKeys });

    res.status(200).json({ success: true, imageUrl: url });
  } catch (error) {
    console.error('Error processing API request:', error);
    res.status(500).send('Internal Server Error');
  }
});