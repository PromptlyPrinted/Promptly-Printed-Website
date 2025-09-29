'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Trophy, Heart, Users, Clock, Zap } from 'lucide-react';

interface ShowdownEntry {
  id: string;
  designer: string;
  title: string;
  image: string;
  votes: number;
  category: string;
  timeRemaining: string;
}

export const SpookStyleShowdown = () => {
  const [currentChallenge, setCurrentChallenge] = useState<ShowdownEntry[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  // Mock data for the daily challenge
  const mockShowdownData: ShowdownEntry[] = [
    {
      id: 'entry-1',
      designer: 'Sarah M.',
      title: 'Midnight Witch Academy',
      image: '/api/placeholder/300/300',
      votes: 127,
      category: 'Spooky Scholar',
      timeRemaining: '8h 23m'
    },
    {
      id: 'entry-2',
      designer: 'Alex R.',
      title: 'Cyber Vampire 2025',
      image: '/api/placeholder/300/300',
      votes: 94,
      category: 'Tech Terror',
      timeRemaining: '8h 23m'
    },
    {
      id: 'entry-3',
      designer: 'Emma L.',
      title: 'Enchanted Forest Spirit',
      image: '/api/placeholder/300/300',
      votes: 156,
      category: 'Nature Nightmare',
      timeRemaining: '8h 23m'
    },
    {
      id: 'entry-4',
      designer: 'Jordan K.',
      title: 'Retro Horror Arcade',
      image: '/api/placeholder/300/300',
      votes: 89,
      category: 'Nostalgic Nightmare',
      timeRemaining: '8h 23m'
    }
  ];

  useEffect(() => {
    setCurrentChallenge(mockShowdownData);
  }, []);

  const handleVote = (entryId: string) => {
    if (userVotes.has(entryId)) return;

    // Award points for voting
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('spookSparks', 10);
    }

    setUserVotes(prev => new Set([...prev, entryId]));
    setCurrentChallenge(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, votes: entry.votes + 1 }
          : entry
      )
    );
  };

  const handleJoinChallenge = () => {
    // Award points for joining challenge
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 250);
    }

    console.log('Navigate to challenge submission');
    // TODO: Navigate to design submission flow
  };

  const sortedEntries = [...currentChallenge].sort((a, b) => b.votes - a.votes);
  const winner = sortedEntries[0];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#1a0b2e]">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Spook & Style Showdown
              </span>
            </h2>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>

          <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-6">
            Vote for today's most hauntingly beautiful designs and compete for the ultimate Halloween honor
          </p>

          {/* Challenge Info */}
          <div className="inline-flex items-center gap-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 backdrop-blur-sm border border-yellow-500/30 rounded-xl px-6 py-3">
            <div className="flex items-center gap-2 text-yellow-300">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">8h 23m remaining</span>
            </div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
            <div className="flex items-center gap-2 text-orange-300">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">500 🎃 Pumpkin Tokens Prize</span>
            </div>
          </div>
        </div>

        {/* Current Leader */}
        {winner && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border-2 border-yellow-500/50 rounded-2xl p-6 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm">
                👑 Current Leader
              </div>

              <div className="text-center pt-4">
                <img
                  src={winner.image}
                  alt={winner.title}
                  className="w-32 h-32 mx-auto rounded-xl object-cover mb-4 border-2 border-yellow-400/50"
                />
                <h3 className="text-2xl font-bold text-white mb-2">{winner.title}</h3>
                <p className="text-yellow-300 mb-2">by {winner.designer}</p>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-bold text-xl">{winner.votes} votes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Entries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sortedEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={`group bg-gradient-to-b from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-105 ${
                index === 0
                  ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/25'
                  : 'border-purple-500/20 hover:border-purple-400/50'
              }`}
            >
              {/* Rank Badge */}
              <div className="relative">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' : 'bg-purple-600'
                }`}>
                  {index + 1}
                </div>
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                  {entry.category}
                </div>
              </div>

              {/* Entry Info */}
              <div className="p-4">
                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
                  {entry.title}
                </h4>
                <p className="text-purple-300 text-sm mb-3">by {entry.designer}</p>

                {/* Vote Button */}
                <Button
                  onClick={() => handleVote(entry.id)}
                  disabled={userVotes.has(entry.id)}
                  className={`w-full ${
                    userVotes.has(entry.id)
                      ? 'bg-green-600 hover:bg-green-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                  } text-white font-semibold`}
                >
                  {userVotes.has(entry.id) ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      Voted!
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Vote
                    </>
                  )}
                </Button>

                {/* Vote Count */}
                <div className="flex items-center justify-center gap-1 mt-3 text-purple-300">
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{entry.votes}</span>
                  <span className="text-sm">votes</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Challenge CTA */}
        <div className="text-center bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-4">
            Think You Can Create Something Even Better?
          </h3>
          <p className="text-xl text-purple-200 mb-6">
            Submit your own design to tomorrow's Spook & Style Showdown and compete for the crown!
          </p>

          <div className="space-y-4">
            <Button
              onClick={handleJoinChallenge}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Join Tomorrow's Challenge
            </Button>

            <div className="text-purple-300 text-sm">
              Win 500 🎃 Pumpkin Tokens (£5 design credit) + eternal bragging rights
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h4 className="text-2xl font-bold text-white text-center mb-8">How the Showdown Works</h4>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h5 className="text-white font-semibold mb-2">Create</h5>
              <p className="text-purple-300 text-sm">Design your Halloween masterpiece using our AI tools</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗳️</span>
              </div>
              <h5 className="text-white font-semibold mb-2">Vote</h5>
              <p className="text-purple-300 text-sm">Community votes determine the daily winners</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h5 className="text-white font-semibold mb-2">Win</h5>
              <p className="text-purple-300 text-sm">Winners get Pumpkin Tokens and community recognition</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};