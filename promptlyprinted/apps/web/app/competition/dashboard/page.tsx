'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Check, Clock, X, Copy, Upload, Share2, Heart, Trophy, Gift } from 'lucide-react';
import Image from 'next/image';

type VerificationStatus = {
  purchase: {
    verified: boolean;
    orderId?: number;
    date?: string;
  };
  socialFollow: {
    verified: boolean;
    pending: boolean;
    platform?: string;
    username?: string;
  };
  wearingPhoto: {
    verified: boolean;
    url?: string;
    points: number;
  };
  referrals: {
    code: string;
    total: number;
    completed: number;
    pending: number;
    pointsEarned: number;
    shareUrls: {
      quiz: string;
      landing: string;
      design: string;
    };
  };
  totalPoints: number;
  rank?: number;
};

export default function CompetitionDashboard() {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingSocial, setUploadingSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({
    platform: 'instagram',
    username: '',
    screenshot: null as File | null,
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);

      // Fetch all verification statuses in parallel
      const [purchaseRes, socialRes, referralRes, pointsRes] = await Promise.all([
        fetch('/api/competition/verify-purchase'),
        fetch('/api/competition/verify-social-follow'),
        fetch('/api/competition/referral'),
        fetch('/api/users/me/points'),
      ]);

      const purchaseData = await purchaseRes.json();
      const socialData = await socialRes.json();
      const referralData = await referralRes.json();
      const pointsData = await pointsRes.json();

      setStatus({
        purchase: {
          verified: purchaseData.verified || false,
          orderId: purchaseData.orderId,
          date: purchaseData.date,
        },
        socialFollow: {
          verified: socialData.verified || false,
          pending: socialData.pending || false,
          platform: socialData.platform,
          username: socialData.username,
        },
        wearingPhoto: {
          verified: false, // TODO: fetch from entry
          points: 100,
        },
        referrals: {
          code: referralData.referralCode || '',
          total: referralData.stats?.total || 0,
          completed: referralData.stats?.completed || 0,
          pending: referralData.stats?.pending || 0,
          pointsEarned: referralData.stats?.totalPointsEarned || 0,
          shareUrls: referralData.shareUrls || {},
        },
        totalPoints: pointsData.points || 0,
        rank: pointsData.rank,
      });
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('entryId', 'YOUR_ENTRY_ID'); // Get from state

      const response = await fetch('/api/competition/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      alert(`Success! You earned ${data.pointsAwarded} points!`);
      fetchStatus();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUploadingSocial(true);

      const formData = new FormData();
      formData.append('platform', socialForm.platform);
      formData.append('username', socialForm.username);
      if (socialForm.screenshot) {
        formData.append('screenshot', socialForm.screenshot);
      }

      const response = await fetch('/api/competition/verify-social-follow', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Verification failed');

      const data = await response.json();
      alert(data.message);
      fetchStatus();
    } catch (error) {
      console.error('Error verifying social:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setUploadingSocial(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const shareUrl = (url: string, platform: string) => {
    const shareUrls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Join the Christmas competition and win $500 USD!')}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent('Join the Christmas competition and win $500 USD! ' + url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Competition Entry Found</h2>
          <p className="text-gray-600 mb-6">Complete a purchase to enter the competition</p>
          <Button asChild>
            <a href="/christmas-2025/quiz">Take the Quiz</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Competition Dashboard 🎄
          </h1>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{status.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            {status.rank && (
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">#{status.rank}</div>
                <div className="text-sm text-gray-600">Current Rank</div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Purchase Verification */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  status.purchase.verified
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {status.purchase.verified ? <Check className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Purchase Verification</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {status.purchase.verified
                    ? `✅ Verified! Order #${status.purchase.orderId}`
                    : '❌ Purchase required to enter competition'}
                </p>
                {!status.purchase.verified && (
                  <Button asChild size="sm">
                    <a href="/christmas-2025/quiz">Complete Purchase</a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Social Follow Verification */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  status.socialFollow.verified
                    ? 'bg-green-100 text-green-600'
                    : status.socialFollow.pending
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {status.socialFollow.verified ? (
                  <Check className="w-6 h-6" />
                ) : status.socialFollow.pending ? (
                  <Clock className="w-6 h-6" />
                ) : (
                  <Heart className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Social Follow (+50 pts)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {status.socialFollow.verified
                    ? `✅ Verified on ${status.socialFollow.platform}`
                    : status.socialFollow.pending
                    ? '⏳ Pending verification (24-48 hours)'
                    : 'Follow us on social media'}
                </p>

                {!status.socialFollow.verified && !status.socialFollow.pending && (
                  <form onSubmit={handleSocialSubmit} className="space-y-3">
                    <select
                      value={socialForm.platform}
                      onChange={(e) =>
                        setSocialForm({ ...socialForm, platform: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="twitter">Twitter</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Your username"
                      value={socialForm.username}
                      onChange={(e) =>
                        setSocialForm({ ...socialForm, username: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setSocialForm({
                          ...socialForm,
                          screenshot: e.target.files?.[0] || null,
                        })
                      }
                      className="w-full text-sm"
                    />
                    <Button type="submit" size="sm" disabled={uploadingSocial} className="w-full">
                      {uploadingSocial ? 'Submitting...' : 'Submit for Verification'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Wearing Photo */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  status.wearingPhoto.verified
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {status.wearingPhoto.verified ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Wearing Photo (+100 pts)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {status.wearingPhoto.verified
                    ? '✅ Photo verified!'
                    : 'Upload a photo of you wearing your design'}
                </p>
                {!status.wearingPhoto.verified && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="text-sm"
                    />
                    {uploadingPhoto && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referrals */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Share2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Referrals (+150 pts each)
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {status.referrals.completed} completed • {status.referrals.pending} pending •{' '}
                  {status.referrals.pointsEarned} pts earned
                </p>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 text-sm font-mono bg-white px-2 py-1 rounded border">
                      {status.referrals.code}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(status.referrals.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareUrl(status.referrals.shareUrls.quiz, 'facebook')}
                    >
                      Facebook
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareUrl(status.referrals.shareUrls.quiz, 'twitter')}
                    >
                      Twitter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareUrl(status.referrals.shareUrls.quiz, 'whatsapp')}
                    >
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Link */}
        <div className="text-center">
          <Button size="lg" asChild>
            <a href="/showcase?competition=christmas-2025">
              <Trophy className="w-5 h-5 mr-2" />
              View Competition Leaderboard
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
