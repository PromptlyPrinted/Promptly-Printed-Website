import { database } from '@repo/database';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@repo/design-system/components/ui/button';
import { Trophy, Star, Heart, ArrowLeft, Clock, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Design Showcase | Promptly Printed',
  description: 'Browse and vote on amazing community designs',
};

interface PageProps {
  searchParams: Promise<{ competition?: string }>;
}

export default async function ShowcasePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const competitionId = params.competition;

  // If no competition ID, show all designs or latest competition
  let competition = null;
  let entries: any[] = [];

  if (competitionId) {
    competition = await database.competition.findUnique({
      where: { id: competitionId },
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            design: {
              include: {
                savedImage: true,
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
            _count: {
              select: {
                votes: true,
                likes: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!competition) {
      notFound();
    }

    entries = competition.entries;
  } else {
    // Show latest active competition
    competition = await database.competition.findFirst({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'desc' },
      include: {
        entries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            design: {
              include: {
                savedImage: true,
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
            _count: {
              select: {
                votes: true,
                likes: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
      },
    });

    if (!competition) {
      return (
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-[#FF8A26]" />
            <h1 className="mb-4 text-4xl font-bold">No Active Competition</h1>
            <p className="mb-8 text-lg text-gray-600">
              Check back soon for the next design competition!
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    entries = competition.entries;
  }

  const daysRemaining = Math.ceil(
    (competition.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isActive = daysRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D2C45] to-[#1a4d6f]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0D2C45]/50 backdrop-blur-sm">
        <div className="container py-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="text-5xl">{competition.themeIcon}</span>
                <h1 className="text-4xl font-bold text-white md:text-5xl">
                  {competition.theme}
                </h1>
              </div>
              <p className="text-lg text-white/80">{competition.description}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="font-bold text-white">{competition.prize}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-[#16C1A8]" />
                <span className="text-white">
                  {isActive
                    ? `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`
                    : 'Ended'}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-[#FF8A26]" />
                <span className="text-white">{entries.length} Entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entries Grid */}
      <div className="container py-12">
        {entries.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/10 p-12 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-[#FF8A26]" />
            <h2 className="mb-2 text-2xl font-bold text-white">No Entries Yet</h2>
            <p className="mb-6 text-white/80">
              Be the first to submit your design and compete for the {competition.prize}{' '}
              prize!
            </p>
            <Button
              size="lg"
              className="bg-[#16C1A8] text-white hover:bg-[#16C1A8]/90"
              asChild
            >
              <Link href={`/designs?funnel=${competition.funnelTag}`}>
                Submit Your Design
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {entries.map((entry, index) => {
              const displayName =
                entry.user.username || entry.user.name || 'Anonymous Designer';
              const voteCount = entry._count.votes;
              const likeCount = entry._count.likes;

              return (
                <div
                  key={entry.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:scale-105 hover:border-[#16C1A8] hover:shadow-2xl hover:shadow-[#16C1A8]/20"
                >
                  {/* Rank Badge for Top 3 */}
                  {index < 3 && (
                    <div className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 font-bold text-white shadow-lg">
                      #{index + 1}
                    </div>
                  )}

                  {/* Design Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#16C1A8] to-[#FF8A26]">
                    {entry.design.savedImage?.url ? (
                      <Image
                        src={entry.design.savedImage.url}
                        alt={entry.design.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-white/80">
                        Design Preview
                      </div>
                    )}

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* Info Section */}
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold text-lg text-white">
                      {entry.design.name}
                    </h3>

                    {/* User Info */}
                    <div className="mb-3 flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-[#16C1A8] to-[#0D2C45]">
                        {entry.user.image ? (
                          <Image
                            src={entry.user.image}
                            alt={displayName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-bold text-sm text-white">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-white/80">{displayName}</span>
                    </div>

                    {/* Stats */}
                    <div className="mb-3 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-white/60">
                        <Star className="h-4 w-4" />
                        {voteCount}
                      </span>
                      <span className="flex items-center gap-1 text-white/60">
                        <Heart className="h-4 w-4" />
                        {likeCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/30 text-white hover:bg-white/10"
                        asChild
                      >
                        <Link href={`/designs/${entry.designId}`}>View</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 border-[#16C1A8] bg-[#16C1A8] text-white hover:bg-[#16C1A8]/90"
                      >
                        <Star className="mr-1 h-4 w-4" />
                        Vote
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
