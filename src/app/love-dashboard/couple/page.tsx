"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Pencil, Heart, Copy } from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface CoupleRequest {
  id: string;
  fromUserId: string;
  fromUserEmail: string;
  fromUserDisplayName: string;
  toUserId: string;
  toUserEmail: string;
  toUserDisplayName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

interface Couple {
  id: string;
  name: string;
  description: string;
  anniversary: string;
  members: {
    id: string;
    email: string;
    displayName: string;
  }[];
  apiKeys?: ApiKey[];
}

export default function CouplePage() {
  const { currentUser, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [coupleName, setCoupleName] = useState('');
  const [coupleDescription, setCoupleDescription] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [incomingRequests, setIncomingRequests] = useState<CoupleRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<CoupleRequest[]>([]);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for user document to get coupleId
    const userUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (userDoc) => {
      const coupleId = userDoc.data()?.coupleId;
      
      if (coupleId) {
        // If user has a coupleId, listen to that couple document
        const coupleUnsubscribe = onSnapshot(doc(db, 'couples', coupleId), (coupleDoc) => {
          if (coupleDoc.exists()) {
            const coupleData = coupleDoc.data() as Omit<Couple, 'id'>;
            setCouple({ ...coupleData, id: coupleDoc.id });
            setCoupleName(coupleData.name);
            setCoupleDescription(coupleData.description || '');
            setAnniversary(coupleData.anniversary);
          } else {
            setCouple(null);
          }
        });

        return () => coupleUnsubscribe();
      } else {
        setCouple(null);
      }
    });

    // Listen for incoming coupleRequests
    const incomingRequestsQuery = query(
      collection(db, 'coupleRequests'),
      where('toUserEmail', '==', currentUser.email),
      where('status', '==', 'pending')
    );

    const incomingUnsubscribe = onSnapshot(incomingRequestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CoupleRequest[];
      setIncomingRequests(requests);
    });

    // Listen for outgoing coupleRequests
    const outgoingRequestsQuery = query(
      collection(db, 'coupleRequests'),
      where('fromUserEmail', '==', currentUser.email),
      where('status', '==', 'pending')
    );

    const outgoingUnsubscribe = onSnapshot(outgoingRequestsQuery, (snapshot) => {
      console.log('Outgoing requests snapshot:', snapshot.docs.map(doc => doc.data())); // Debug log
      const requests = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as CoupleRequest[];
      setOutgoingRequests(requests);
    });

    return () => {
      userUnsubscribe();
      incomingUnsubscribe();
      outgoingUnsubscribe();
    };
  }, [currentUser]);

  const handleInvite = async () => {
    if (!currentUser) return;

    try {
      // First check if the email is valid and not the current user's email
      if (!searchEmail || searchEmail === currentUser.email) {
        throw new Error('Please enter a valid email address');
      }

      console.log('Creating couple request with data:', {
        fromUserId: currentUser.uid,
        fromUserEmail: currentUser.email,
        fromUserDisplayName: currentUser.displayName || currentUser.email?.split('@')[0],
        toUserEmail: searchEmail,
        toUserId: '',
        toUserDisplayName: searchEmail.split('@')[0],
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      // Create couple request
      const docRef = await addDoc(collection(db, 'coupleRequests'), {
        fromUserId: currentUser.uid,
        fromUserEmail: currentUser.email,
        fromUserDisplayName: currentUser.displayName || currentUser.email?.split('@')[0],
        toUserEmail: searchEmail,
        toUserId: '',
        toUserDisplayName: searchEmail.split('@')[0],
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      console.log('Successfully created document with ID:', docRef.id);

      setSearchEmail('');
      toast({
        title: "Success",
        description: "Invitation sent successfully! When your partner signs in with this email, they'll see your invitation.",
      });
    } catch (error: any) {
      console.error('Error creating couple request:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Updated to simply mark the request as accepted.
  // A Cloud Function triggered on the update to a coupleRequest (status: "accepted")
  // will handle creating the couple (team) document and updating both user profiles.
  const handleAcceptRequest = async (request: CoupleRequest) => {
    if (!currentUser) return;
    
    try {
      const requestRef = doc(db, 'coupleRequests', request.id);
      await updateDoc(requestRef, {
        toUserId: currentUser.uid,
        toUserDisplayName: currentUser.displayName || currentUser.email?.split('@')[0],
        status: 'accepted'
      });
      toast({
        title: "Success",
        description: "Invitation accepted! Your couple is being set up.",
      });
    } catch (error) {
      console.error('Error accepting request: ', error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'coupleRequests', requestId));
      toast({
        title: "Success",
        description: "Request rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCouple = async () => {
    if (!couple || !currentUser) return;

    try {
      await updateDoc(doc(db, 'couples', couple.id), {
        name: coupleName,
        description: coupleDescription,
        anniversary: anniversary,
      });

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Couple details updated successfully!",
      });
    } catch (error) {
      console.log("Debug error:", error);
      toast({
        title: "Error",
        description: "Failed to update couple details",
        variant: "destructive",
      });
    }
  };

  const handleCreateApiKey = async () => {
    if (!couple || !currentUser || !newApiKeyName) return;

    try {
      // Create a new document in the pendingApiKeys subcollection
      await addDoc(collection(db, 'couples', couple.id, 'pendingApiKeys'), {
        name: newApiKeyName,
        requestedBy: currentUser.uid,
        timestamp: new Date().toISOString(),
      });

      setNewApiKeyName('');
      toast({
        title: "Success",
        description: "API key creation in progress",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
      <div className="container mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Love Connection</CardTitle>
            <CardDescription>
              Connect with your partner to start sharing moments together.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Invite your partner by email</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="partner@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleInvite}
                  className="w-full sm:w-auto"
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {incomingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Someone wants to connect with you! Review and respond to your invitations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{request.fromUserDisplayName}</p>
                    <p className="text-sm text-muted-foreground">{request.fromUserEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Sent {new Date(request.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleAcceptRequest(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => handleRejectRequest(request.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {outgoingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sent Invitations</CardTitle>
              <CardDescription>
                Pending invitations you've sent to others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {outgoingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{request.toUserDisplayName}</p>
                    <p className="text-sm text-muted-foreground">{request.toUserEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Sent {new Date(request.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleRejectRequest(request.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const daysSinceAnniversary = differenceInDays(new Date(), new Date(couple.anniversary));

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            {isEditing ? (
              <div className="space-y-6 w-full">
                <div>
                  <Label htmlFor="coupleName">Couple Name</Label>
                  <Input
                    id="coupleName"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="coupleDescription">Couple Description</Label>
                  <Textarea
                    id="coupleDescription"
                    value={coupleDescription}
                    onChange={(e) => setCoupleDescription(e.target.value)}
                    className="mt-2"
                    placeholder="Write something about your relationship..."
                  />
                </div>
                <div>
                  <Label htmlFor="anniversary">Anniversary Date</Label>
                  <Input
                    id="anniversary"
                    type="date"
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleUpdateCouple} className="w-full">Save Changes</Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-3xl">{couple.name}</CardTitle>
                  <div className="flex flex-col items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        navigator.clipboard.writeText(couple.id);
                        toast({
                          title: "Copied!",
                          description: "Couple ID copied to clipboard",
                          duration: 2000,
                        });
                      }}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">Copy ID</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-lg text-center sm:text-left">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 flex-shrink-0" />
              <span>Together since</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1">
              <span>{format(new Date(couple.anniversary), 'PP')}</span>
              <span>({daysSinceAnniversary} days)</span>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4">
            {couple.members.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-medium">
                    {member.displayName[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-lg mt-2">{member.displayName}</span>
                </div>
                {index === 0 && (
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-pink-500 animate-pulse flex-shrink-0" fill="currentColor" />
                )}
              </div>
            ))}
          </div>

          {!isEditing && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">API Keys</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? 'Hide' : 'Show'} API Keys
                </Button>
              </div>
              
              {showApiKeys && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="API Key Name"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                    />
                    <Button onClick={handleCreateApiKey}>Create API Key</Button>
                  </div>
                  
                  {couple.apiKeys?.map((apiKey) => (
                    <div key={apiKey.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{apiKey.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          {copiedKey === apiKey.key ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                        {apiKey.lastUsed && (
                          <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}