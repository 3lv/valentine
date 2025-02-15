"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { serverTimestamp } from 'firebase/firestore';
import { collection, addDoc, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Skeleton } from "@/components/ui/skeleton"
import ImageWithSkeleton from '@/components/dashboard/ImageWithSkeleton';

interface BackgroundImage {
  imageUrl: string;
  timestamp: any; // or use the specific Firestore Timestamp type
  userId: string;
  isLoading?: boolean;
}

export default function BackgroundPage() {
  const { currentUser, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [couple, setCouple] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    const userUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
      const coupleId = userDoc.data()?.coupleId;
      
      if (coupleId) {
        setCouple({ id: coupleId });
        
        const backgroundsQuery = query(
          collection(db, 'couples', coupleId, 'backgrounds'),
          where('active', '==', true)
        );

        const backgroundsUnsubscribe = onSnapshot(backgroundsQuery, (snapshot) => {
          const newImages = snapshot.docs
            .map(doc => ({
              ...doc.data() as BackgroundImage,
              isLoading: false
            }))
            .sort((a, b) => {
              // Handle cases where timestamp might be a Firestore Timestamp or null
              const timeA = a.timestamp?.toMillis?.() || 0;
              const timeB = b.timestamp?.toMillis?.() || 0;
              return timeB - timeA; // Sort descending (newest first)
            });
          setImages(newImages);
          setIsLoading(false);
        });

        return () => backgroundsUnsubscribe();
      } else {
        setCouple(null);
        setImages([]);
        setIsLoading(false);
      }
    });

    return () => userUnsubscribe();
  }, [currentUser]);

  const handleFileSelect = async (file: File) => {
    if (!currentUser || !couple) return;

    setIsUploading(true);
    setUploadProgress(0);

    const now = serverTimestamp();
    // Add a temporary skeleton image at the beginning of the array
    const tempImage: BackgroundImage = {
      imageUrl: '',
      timestamp: now,
      userId: currentUser.uid,
      isLoading: true
    };
    
    // Insert the temp image at the beginning, maintaining sort order
    setImages(prev => [tempImage, ...prev]);

    try {
      const storageRef = ref(storage, `couples/${couple.id}/backgrounds/${Date.now()}-${file.name}`);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
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
        timestamp: now, // Use the same timestamp as the temp image
        active: true,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email?.split('@')[0]
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      // Remove the temporary image if upload fails
      setImages(prev => prev.filter(img => !img.isLoading));
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

      {/* Current Background Card */}
      {images.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Background</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <HoverCard>
              <HoverCardTrigger>
                <div className="relative w-[300px] aspect-[16/9] transition-transform hover:scale-105">
                  <ImageWithSkeleton
                    src={images[0].imageUrl}
                    alt="Current Background"
                    className="border-4 border-white shadow-lg rounded-lg absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Uploaded on: {images[0].timestamp && images[0].timestamp.toDate ? images[0].timestamp.toDate().toLocaleDateString() : 'Unknown date'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded by: {currentUser.email}
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Backgrounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-fr">
            {images
              .slice(1) // Skip the first image as it's shown above
              .sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp, newest first
              .map((image) => (
              <HoverCard key={image.imageUrl + image.timestamp}>
                <HoverCardTrigger>
                  <div className="relative aspect-[16/9] transition-transform hover:scale-105">
                    {image.isLoading ? (
                      <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
                    ) : (
                      <ImageWithSkeleton
                        src={image.imageUrl}
                        alt={`Background ${image.timestamp}`}
                        className="rounded-lg absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                </HoverCardTrigger>
                {!image.isLoading && (
                  <HoverCardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Uploaded on: {image.timestamp && image.timestamp.toDate ? image.timestamp.toDate().toLocaleDateString() : 'Unknown date'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded by: {currentUser.email}
                      </p>
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}