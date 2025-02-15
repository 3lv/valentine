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
    
    // Get the latest background
    const backgroundsSnapshot = await coupleDoc.ref
      .collection('backgrounds')
      .where('active', '==', true)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (backgroundsSnapshot.empty) {
      res.status(404).json({ message: 'No backgrounds found' });
      return;
    }

    const background = backgroundsSnapshot.docs[0].data();
    
    // Get the image from the direct download URL and convert to base64
    const imageUrl = background.imageUrl;
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    res.status(200).json({
      ...background,
      image: base64Image
    });
  } catch (error) {
    console.error('Error getting latest background:', error);
    res.status(500).send('Internal Server Error');
  }
});