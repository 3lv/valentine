import { onRequest } from 'firebase-functions/v2/https';
import admin from 'firebase-admin';

export const getLatestBackground = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== 'GET') {
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
    // Retrieve the couple document using coupleId
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
    
    // Fetch the latest active background
    const backgroundsSnapshot = await coupleDoc.ref
      .collection('backgrounds')
      .where('active', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (backgroundsSnapshot.empty) {
      res.status(404).send('No backgrounds found');
      return;
    }

    const background = backgroundsSnapshot.docs[0].data();
    
    // Fetch the image from the imageUrl
    const imageUrl = background.imageUrl;
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error('Failed to download image');
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Set response headers for the image
    res.set('Content-Type', contentType);
    //res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Buffer the image and send it
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
    
  } catch (error) {
    console.error('Error getting latest background:', error);
    res.status(500).send('Internal Server Error');
  }
});