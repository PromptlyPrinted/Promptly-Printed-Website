'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { Trophy, Medal, Award, Sparkles, Star, Flame } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar: string | null;
  designId: string;
  designName?: string;
  designImage: string | null;
  votes: number;
  likes: number;
  points: number;
  badge: 'gold' | 'silver' | 'bronze' | null;
}

interface CompetitionResponse {
  id: string;
  theme: string;
  themeIcon: string;
  prize: string;
  endDate: string;
  totalEntries: number;
  funnelTag: string;
}

const getBadgeIcon = (badge: LeaderboardEntry['badge']) => {
  switch (badge) {
    case 'gold':
      return <Trophy className="w-5 h-5 text-yellow-400" />;
    case 'silver':
      return <Medal className="w-5 h-5 text-gray-200" />;
    case 'bronze':
      return <Award className="w-5 h-5 text-amber-400" />;
    default:
      return null;
  }
};

export const CompetitionLeaderboardSection = () => {
  const [competition, setCompetition] = useState<CompetitionResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const competitionResponse = await fetch('/api/competitions/current', { cache: 'no-store' });
        if (!competitionResponse.ok) {
          if (competitionResponse.status === 404) {
            setError('Competition will launch shortly—watch this space.');
            return;
          }
          throw new Error(`Failed to load competition (${competitionResponse.status})`);
        }

        const competitionData = (await competitionResponse.json()) as CompetitionResponse;
        if (!isMounted) return;
        setCompetition(competitionData);

        const leaderboardResponse = await fetch(
          `/api/competitions/${competitionData.id}/leaderboard?limit=5`,
          { cache: 'no-store' }
        );

        if (!leaderboardResponse.ok) {
          throw new Error(`Failed to load leaderboard (${leaderboardResponse.status})`);
        }

        const leaderboardData = (await leaderboardResponse.json()) as LeaderboardEntry[];
        if (!isMounted) return;
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error('Competition leaderboard error:', err);
        if (isMounted) {
          setError('We’re refreshing the leaderboard. Check back in a moment.');
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const subtitle = useMemo(() => {
    if (!competition) return '';
    return `${competition.themeIcon} ${competition.theme} — ${competition.totalEntries} entries so far`;
  }, [competition]);

  return (
    <section className="py-20 bg-gradient-to-b from-[#06070a] to-[#0d1324]" id="leaderboard">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-sm mb-4">
            <Sparkles className="w-4 h-4 text-orange-300" />
            Community leaderboard
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the Halloween Design Showdown
          </h2>
          <p className="text-purple-200 max-w-3xl mx-auto">{error ?? subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="bg-gradient-to-r from-[#16C1A8] to-[#0D2C45] p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white">Top Creators</h3>
              <p className="text-white/70 text-sm">Vote for your favourites and climb the rankings.</p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="border-white/60 text-white hover:bg-white/10"
              onClick={() => window.open('/showcase', '_self')}
            >
              View showcase
            </Button>
          </div>

          <div className="divide-y divide-white/10">
            {leaderboard.map((entry) => (
              <div key={`${entry.userId}-${entry.rank}`} className="p-6 hover:bg-white/5 transition">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1 min-w-[52px]">
                    <div
                      className={`text-2xl font-bold ${
                        entry.rank === 1
                          ? 'text-yellow-400'
                          : entry.rank === 2
                            ? 'text-gray-300'
                            : entry.rank === 3
                              ? 'text-amber-400'
                              : 'text-white/60'
                      }`}
                    >
                      #{entry.rank}
                    </div>
                    {getBadgeIcon(entry.badge)}
                  </div>

                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#16C1A8] to-[#FF8A26] ring-2 ring-white/10">
                    {entry.designImage ? (
                      <Image
                        src={entry.designImage}
                        alt={entry.designName ?? `Design by ${entry.username}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80">
                        Design preview
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid md:grid-cols-[1fr,auto] gap-6 items-center">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${entry.userId}`}
                        className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#16C1A8] to-[#0D2C45] ring-2 ring-white/10"
                      >
                        {entry.avatar ? (
                          <Image src={entry.avatar} alt={entry.username} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link
                          href={`/profile/${entry.userId}`}
                          className="text-white font-semibold text-lg hover:text-[#16C1A8] transition"
                        >
                          {entry.username}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-white/70">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400" />
                            {entry.votes.toLocaleString()} votes
                          </span>
                          <span className="text-white/40">•</span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            {entry.points.toLocaleString()} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        onClick={() => window.open(`/designs/${entry.designId}`, '_self')}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#16C1A8] hover:bg-[#16C1A8]/80 text-white"
                        onClick={() => window.open(`/designs/${entry.designId}?vote=true`, '_self')}
                      >
                        Vote
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!leaderboard.length && (
              <div className="p-6 text-center text-white/70">
                Be the first to submit and claim the top spot on the leaderboard.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
