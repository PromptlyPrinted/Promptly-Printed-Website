'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@repo/design-system/components/ui/button';
import { Trophy, Medal, Award, ArrowRight, Clock, Sparkles, Star, Flame, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// TODO: Replace with actual API call to fetch competition data
// Example: const { competition, leaderboard } = await getCompetitionData(competitionId);

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  designId: string;
  designImage: string | null;
  votes: number;
  likes: number;
  points: number;
  badge: 'gold' | 'silver' | 'bronze' | null;
}

interface Competition {
  id: string;
  theme: string;
  themeIcon: string;
  prize: string;
  startDate: Date;
  endDate: Date;
  totalEntries: number;
  description: string;
  funnelTag: string; // e.g., 'halloween-2025', 'black-friday-2024'
  isActive?: boolean;
}

type CompetitionApiResponse = Omit<Competition, 'startDate' | 'endDate' | 'isActive'> & {
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const DEFAULT_LEADERBOARD_LIMIT = 5;

export const WhyDifferent = () => {
  const [currentCompetition, setCurrentCompetition] = useState<Competition | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const competitionResponse = await fetch('/api/competitions/current', {
          cache: 'no-store',
        });

        if (!competitionResponse.ok) {
          if (competitionResponse.status === 404) {
            if (isMounted) {
              setError('No active competition is currently running. Check back soon!');
            }
            return;
          }

          throw new Error(`Failed to load competition (${competitionResponse.status})`);
        }

        const competitionData = (await competitionResponse.json()) as CompetitionApiResponse;
        const parsedCompetition: Competition = {
          ...competitionData,
          startDate: new Date(competitionData.startDate),
          endDate: new Date(competitionData.endDate),
        };

        if (isMounted) {
          setCurrentCompetition(parsedCompetition);
        }

        const leaderboardResponse = await fetch(
          `/api/competitions/${competitionData.id}/leaderboard?limit=${DEFAULT_LEADERBOARD_LIMIT}`,
          {
            cache: 'no-store',
          }
        );

        if (!leaderboardResponse.ok) {
          throw new Error(`Failed to load leaderboard (${leaderboardResponse.status})`);
        }

        const leaderboardData = (await leaderboardResponse.json()) as LeaderboardEntry[];

        if (isMounted) {
          setLeaderboard(leaderboardData);
        }
      } catch (err) {
        console.error('Error loading competition leaderboard:', err);
        if (isMounted) {
          setError('We had trouble loading the latest leaderboard. Please try again soon.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const timeRemainingText = useMemo(() => {
    if (!currentCompetition) return 'Stay tuned';

    const remainingMs = currentCompetition.endDate.getTime() - Date.now();
    if (remainingMs <= 0) {
      return 'Ended';
    }

    const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    return `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`;
  }, [currentCompetition]);

  if (loading) {
    return (
      <div className="w-full bg-[#0D2C45] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF8A26] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#16C1A8] rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center text-white/80">
            <Sparkles className="w-10 h-10 animate-spin text-[#FF8A26]" />
            <p className="text-lg">Loading the latest competition leaderboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentCompetition) {
    return (
      <div className="w-full bg-[#0D2C45] py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF8A26] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#16C1A8] rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-10 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-[#FF8A26]" />
            <h2 className="text-3xl font-bold text-white mb-2">Design Competition</h2>
            <p className="text-white/80">
              {error ||
                'We are gearing up for the next competition. Create a design now and be ready to submit when entries open!'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white px-8 py-6 h-auto shadow-lg shadow-[#16C1A8]/25"
                asChild
              >
                <Link href="/design/mens-classic-t-shirt">
                  Start Designing <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-6 h-auto backdrop-blur-sm"
                asChild
              >
                <Link href="/showcase">
                  <Zap className="w-5 h-5" />
                  View Past Winners
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case 'gold':
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 'silver':
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 'bronze':
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#0D2C45] py-20 lg:py-32 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF8A26] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#16C1A8] rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF8A26]/20 border border-[#FF8A26]/30">
              <Sparkles className="w-4 h-4 text-[#FF8A26]" />
              <span className="text-[#FF8A26] font-semibold text-sm uppercase tracking-wider">
                Design Competition
              </span>
            </div>
            <h2 className="max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight flex items-center justify-center gap-4">
              <span className="text-5xl">{currentCompetition.themeIcon}</span>
              {currentCompetition.theme}
            </h2>
            <p className="max-w-2xl text-lg text-white/80 leading-relaxed">
              {currentCompetition.description}
            </p>

            {/* Competition Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">{currentCompetition.prize} Prize</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Clock className="w-5 h-5 text-[#16C1A8]" />
                <span className="text-white">{timeRemainingText}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-[#FF8A26]" />
                <span className="text-white">{currentCompetition.totalEntries} Entries</span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="w-full max-w-4xl">
            <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              {/* Leaderboard Header */}
              <div className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  Top Designs
                </h3>
                <p className="text-white/70 text-sm mt-1">Vote for your favorites or submit your own!</p>
              </div>

              {/* Leaderboard Entries */}
              <div className="divide-y divide-white/10">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="group p-6 hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-6">
                      {/* Rank */}
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div className={`text-3xl font-bold ${
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-300' :
                          entry.rank === 3 ? 'text-orange-400' :
                          'text-white/60'
                        }`}>
                          #{entry.rank}
                        </div>
                        {entry.badge && getBadgeIcon(entry.badge)}
                      </div>

                      {/* Design Preview */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-[#16C1A8] to-[#FF8A26] flex-shrink-0 ring-2 ring-white/20 group-hover:ring-[#16C1A8] transition-all">
                        {entry.designImage ? (
                          <Image
                            src={entry.designImage}
                            alt={`Design by ${entry.username}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold text-white/80 px-2">
                            Design Preview
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Link
                          href={`/profile/${entry.userId}`}
                          className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#16C1A8] to-[#0D2C45] flex-shrink-0 ring-2 ring-white/20 hover:ring-[#16C1A8] transition-all"
                        >
                          {entry.avatar ? (
                            <Image
                              src={entry.avatar}
                              alt={entry.username}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                              {entry.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/profile/${entry.userId}`}
                            className="font-semibold text-white text-lg hover:text-[#16C1A8] transition-colors"
                          >
                            {entry.username}
                          </Link>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-white/60 flex items-center gap-1">
                              <Star className="w-3 h-3" /> {entry.votes.toLocaleString()} votes
                            </span>
                            <span className="text-white/60">•</span>
                            <span className="text-white/60 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#FF8A26]" /> {entry.points.toLocaleString()} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Link href={`/designs/${entry.designId}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10"
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#16C1A8] text-[#16C1A8] hover:bg-[#16C1A8] hover:text-white"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Vote
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {!leaderboard.length && (
                  <div className="p-6 text-center text-white/70">
                    No entries yet—be the first to submit your design!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Button
              size="lg"
              className="gap-2 bg-[#16C1A8] hover:bg-[#16C1A8]/90 text-white text-lg px-8 py-6 h-auto shadow-lg shadow-[#16C1A8]/25"
              asChild
            >
              <Link href={`/design/mens-classic-t-shirt?campaign=${currentCompetition.funnelTag}`}>
                Submit Your Design <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-white/30 bg-white/10 hover:bg-white/20 text-white text-lg px-8 py-6 h-auto backdrop-blur-sm"
              asChild
            >
              <Link href={`/showcase?competition=${currentCompetition.id}`}>
                <Zap className="w-5 h-5" />
                View All Entries
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
