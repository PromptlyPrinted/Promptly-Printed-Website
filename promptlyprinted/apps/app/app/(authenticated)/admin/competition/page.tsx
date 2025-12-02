'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@repo/auth/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@repo/design-system/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { format } from 'date-fns';
import useSWR from 'swr';

type SocialFollowVerification = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  platform: string;
  username: string;
  screenshotUrl: string | null;
  submittedAt: Date;
};

async function getPendingVerifications() {
  const response = await fetch('/api/admin/competition/pending-social-follows');
  if (!response.ok) {
    throw new Error('Failed to fetch pending verifications');
  }
  return response.json();
}

export default function CompetitionAdminPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const currentUser = session?.user;
  const isLoaded = !isPending;

  const [selectedVerification, setSelectedVerification] =
    useState<SocialFollowVerification | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data,
    isLoading,
    error,
    mutate,
  } = useSWR<{ verifications: SocialFollowVerification[] }>(
    isLoaded ? '/api/admin/competition/pending-social-follows' : null,
    getPendingVerifications,
    { refreshInterval: 10000 } // Refresh every 10 seconds
  );

  // Redirect if not admin
  if (isLoaded && !currentUser) {
    router.push('/sign-in');
    return null;
  }

  if (isLoaded && currentUser?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleApprove = async () => {
    if (!selectedVerification) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        '/api/admin/competition/approve-social-follow',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: selectedVerification.id,
            approved: true,
            notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve verification');
      }

      // Refresh the list
      mutate();
      setShowApproveDialog(false);
      setSelectedVerification(null);
      setNotes('');
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        '/api/admin/competition/approve-social-follow',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verificationId: selectedVerification.id,
            approved: false,
            notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject verification');
      }

      // Refresh the list
      mutate();
      setShowRejectDialog(false);
      setSelectedVerification(null);
      setNotes('');
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6 text-red-500">
            Error loading verifications
          </CardContent>
        </Card>
      </div>
    );
  }

  const verifications = data?.verifications || [];

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Competition - Social Follow Verifications</CardTitle>
          <CardDescription>
            Review and approve social media follow claims for the Christmas
            competition. Each approval awards 50 points to the user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No pending verifications
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Screenshot</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {verification.userName || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {verification.userEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{verification.platform}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      @{verification.username}
                    </TableCell>
                    <TableCell>
                      {verification.screenshotUrl ? (
                        <a
                          href={verification.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Screenshot
                        </a>
                      ) : (
                        <span className="text-gray-400">No screenshot</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(verification.submittedAt),
                        'MMM d, yyyy HH:mm'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowApproveDialog(true);
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedVerification(verification);
                            setShowRejectDialog(true);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Social Follow</DialogTitle>
            <DialogDescription>
              You are about to approve this social media follow verification and
              award 50 points to {selectedVerification?.userName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Platform:</p>
              <p className="text-sm text-gray-600">
                {selectedVerification?.platform}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Username:</p>
              <p className="text-sm text-gray-600">
                @{selectedVerification?.username}
              </p>
            </div>
            {selectedVerification?.screenshotUrl && (
              <div>
                <p className="text-sm font-medium mb-2">Screenshot:</p>
                <img
                  src={selectedVerification.screenshotUrl}
                  alt="Follow screenshot"
                  className="max-w-full h-auto rounded border"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notes (optional):</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveDialog(false);
                setNotes('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting ? 'Approving...' : 'Approve & Award 50 Points'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Social Follow</DialogTitle>
            <DialogDescription>
              You are about to reject this verification. This action will remove
              the pending verification without awarding points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">User:</p>
              <p className="text-sm text-gray-600">
                {selectedVerification?.userName} ({selectedVerification?.userEmail})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">
                Reason for rejection (optional):
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain why this verification is being rejected..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setNotes('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
