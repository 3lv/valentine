"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

interface BackgroundImage {
  imageUrl: string;
  timestamp: string;
  userId: string;
}

export default function BackgroundPage() {
  const { currentUser, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [couple, setCouple] = useState<{ id: string } | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for couple updates
    const coupleQuery = query(
      collection(db, 'couples'),
      where('members', 'array-contains', {
        id: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0]
      })
    );

    const unsubscribe = onSnapshot(coupleQuery, (snapshot) => {
      if (!snapshot.empty) {
        const coupleDoc = snapshot.docs[0];
        setCouple({ id: coupleDoc.id });
        
        // Listen for backgrounds in the couple's collection
        const backgroundsQuery = query(
          collection(db, 'couples', coupleDoc.id, 'backgrounds'),
          where('active', '==', true)
        );

        onSnapshot(backgroundsQuery, (snapshot) => {
          const newImages = snapshot.docs.map(doc => doc.data() as BackgroundImage);
          setImages(newImages);
        });
      } else {
        setCouple(null);
        setImages([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleFileSelect = async (file: File) => {
    if (!currentUser || !couple) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(storage, `couples/${couple.id}/backgrounds/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          throw error;
        }
      );

      await uploadTask;
      const downloadUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'couples', couple.id, 'backgrounds'), {
        userId: currentUser.uid,
        imageUrl: downloadUrl,
        timestamp: new Date().toISOString(),
        active: true,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email?.split('@')[0]
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Please sign in to access this feature</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => signInWithGoogle()}>Sign in with Google</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!couple) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Couple Relationship Required</CardTitle>
            <CardDescription>
              You need to be in a couple relationship to use the Background Manager.
              Please visit the Couple page to create or join a couple.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/love-dashboard/couple'}>
              Go to Couple Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Background Manager</CardTitle>
          <CardDescription>
            Change your lover's phone and PC background from here. While you can take photos directly from your phone,
            this interface provides a convenient way to upload and manage your background collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload onFileSelect={handleFileSelect} />
          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Uploading: {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Backgrounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <HoverCard key={image.imageUrl + image.timestamp}>
                <HoverCardTrigger>
                  <div className="relative w-full pb-[177.78%] transition-transform hover:scale-105">
                    <img
                      src={image.imageUrl}
                      alt={`Background ${image.timestamp}`}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                    />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Uploaded on: {new Date(image.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded by: {currentUser.email}
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}