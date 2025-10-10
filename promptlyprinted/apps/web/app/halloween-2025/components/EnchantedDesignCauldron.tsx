'use client';

import { useState } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Sparkles, RefreshCw, Wand2 } from 'lucide-react';

interface DesignPrompt {
  id: string;
  title: string;
  description: string;
  difficulty: 'Mildly Spooky' | 'Frighteningly Fun' | 'Absolutely Terrifying';
  tags: string[];
  phantomPoints: number;
}

export const EnchantedDesignCauldron = () => {
  const [currentPrompt, setCurrentPrompt] = useState<DesignPrompt | null>(null);
  const [isBrewingAnimation, setIsBrewingAnimation] = useState(false);
  const [brewCount, setBrewCount] = useState(0);

  const designPrompts: { [key: string]: DesignPrompt[] } = {
    'Mildly Spooky': [
      {
        id: 'mild-1',
        title: 'Friendly Neighborhood Ghost',
        description: 'Design a cute ghost who just wants to make friends, wearing a little bow tie and holding a "Boo!" sign',
        difficulty: 'Mildly Spooky',
        tags: ['Cute', 'Friendly', 'Pastel Colors'],
        phantomPoints: 150
      },
      {
        id: 'mild-2',
        title: 'Pumpkin Spice Witch',
        description: 'A cozy witch who runs a coffee shop, complete with autumn leaves and a steaming cauldron of PSL',
        difficulty: 'Mildly Spooky',
        tags: ['Autumn', 'Coffee', 'Cozy Vibes'],
        phantomPoints: 175
      },
      {
        id: 'mild-3',
        title: 'Halloween Study Group',
        description: 'A collection of cute monsters studying together - vampire reading, werewolf taking notes, mummy with highlighters',
        difficulty: 'Mildly Spooky',
        tags: ['Study', 'Cute Monsters', 'Academic'],
        phantomPoints: 200
      }
    ],
    'Frighteningly Fun': [
      {
        id: 'medium-1',
        title: 'Midnight Dance Party',
        description: 'Skeletons having a dance-off in a graveyard disco, complete with glowing bones and funky moves',
        difficulty: 'Frighteningly Fun',
        tags: ['Skeletons', 'Dance', 'Graveyard', 'Neon'],
        phantomPoints: 250
      },
      {
        id: 'medium-2',
        title: 'Time-Traveling Witch',
        description: 'A modern witch who accidentally time-traveled to 2025, mixing medieval spells with futuristic technology',
        difficulty: 'Frighteningly Fun',
        tags: ['Time Travel', 'Tech', 'Modern Magic'],
        phantomPoints: 275
      },
      {
        id: 'medium-3',
        title: 'Monster Food Truck',
        description: 'A vampire running a late-night food truck serving "bloody" good burgers to other creatures of the night',
        difficulty: 'Frighteningly Fun',
        tags: ['Food Truck', 'Vampire', 'Night Scene'],
        phantomPoints: 300
      }
    ],
    'Absolutely Terrifying': [
      {
        id: 'hard-1',
        title: 'Cosmic Horror Awakening',
        description: 'An ancient eldritch being emerging from a portal between dimensions, with tentacles made of starlight and void',
        difficulty: 'Absolutely Terrifying',
        tags: ['Cosmic Horror', 'Tentacles', 'Space', 'Ancient'],
        phantomPoints: 400
      },
      {
        id: 'hard-2',
        title: 'Digital Phantom Virus',
        description: 'A ghostly entity that lives in the internet, corrupting code and haunting social media feeds',
        difficulty: 'Absolutely Terrifying',
        tags: ['Digital Ghost', 'Cyberpunk', 'Glitch Art'],
        phantomPoints: 450
      },
      {
        id: 'hard-3',
        title: 'The Last Halloween',
        description: 'A post-apocalyptic scene where nature has reclaimed the world, and jack-o-lanterns grow from twisted vines',
        difficulty: 'Absolutely Terrifying',
        tags: ['Post-Apocalyptic', 'Nature Horror', 'Dark'],
        phantomPoints: 500
      }
    ]
  };

  const getRandomPrompt = (difficulty?: string) => {
    let allPrompts: DesignPrompt[] = [];

    if (difficulty) {
      allPrompts = designPrompts[difficulty] || [];
    } else {
      allPrompts = Object.values(designPrompts).flat();
    }

    return allPrompts[Math.floor(Math.random() * allPrompts.length)];
  };

  const brewNewDesign = (difficulty?: string) => {
    setIsBrewingAnimation(true);
    setBrewCount(prev => prev + 1);

    // Award points for using the cauldron
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 25);
    }

    setTimeout(() => {
      const newPrompt = getRandomPrompt(difficulty);
      setCurrentPrompt(newPrompt);
      setIsBrewingAnimation(false);
    }, 2000);
  };

  const startDesignWithPrompt = () => {
    if (!currentPrompt) return;

    // Award points for using generated prompt
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', currentPrompt.phantomPoints);
    }

    // Navigate to Halloween design tool with prompt
    window.location.href = '/design/halloween';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Mildly Spooky': return 'from-green-500 to-emerald-600';
      case 'Frighteningly Fun': return 'from-orange-500 to-red-600';
      case 'Absolutely Terrifying': return 'from-red-600 to-purple-700';
      default: return 'from-purple-500 to-indigo-600';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#1a0b2e] to-[#0f1419]">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-green-500 bg-clip-text text-transparent">
              The Enchanted Design Cauldron
            </span>
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Let the mystical cauldron brew up magical design inspiration tailored to your courage level
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Cauldron Animation */}
            <div className="text-center">
              <div className="relative">
                {/* Cauldron */}
                <div className={`relative w-80 h-80 mx-auto mb-8 transition-all duration-1000 ${
                  isBrewingAnimation ? 'animate-pulse scale-110' : ''
                }`}>
                  <div className="w-full h-full bg-gradient-to-b from-gray-700 to-gray-900 rounded-full border-8 border-gray-600 shadow-2xl overflow-hidden">
                    {/* Bubbling liquid */}
                    <div className={`absolute inset-4 rounded-full transition-all duration-2000 ${
                      isBrewingAnimation
                        ? 'bg-gradient-to-t from-purple-600 via-green-500 to-orange-400'
                        : 'bg-gradient-to-t from-purple-900 via-indigo-800 to-purple-700'
                    }`}>
                      {/* Bubbles */}
                      {isBrewingAnimation && (
                        <>
                          <div className="absolute bottom-4 left-8 w-4 h-4 bg-white/30 rounded-full animate-bounce delay-0"></div>
                          <div className="absolute bottom-8 right-12 w-3 h-3 bg-white/40 rounded-full animate-bounce delay-300"></div>
                          <div className="absolute bottom-6 left-16 w-2 h-2 bg-white/50 rounded-full animate-bounce delay-700"></div>
                          <div className="absolute bottom-12 right-8 w-5 h-5 bg-white/20 rounded-full animate-bounce delay-1000"></div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Steam/Magic */}
                  {(isBrewingAnimation || currentPrompt) && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Brew Counter */}
                {brewCount > 0 && (
                  <div className="text-purple-300 text-sm mb-4">
                    Brews conjured: {brewCount} 🧙‍♀️
                  </div>
                )}

                {/* Difficulty Buttons */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg mb-4">Choose Your Courage Level:</h3>

                  {Object.keys(designPrompts).map((difficulty) => (
                    <Button
                      key={difficulty}
                      onClick={() => brewNewDesign(difficulty)}
                      disabled={isBrewingAnimation}
                      className={`w-full bg-gradient-to-r ${getDifficultyColor(difficulty)} hover:scale-105 text-white font-semibold py-3 rounded-xl transition-all duration-300 ${
                        isBrewingAnimation ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Wand2 className="w-5 h-5 mr-2" />
                      {difficulty}
                    </Button>
                  ))}

                  <Button
                    onClick={() => brewNewDesign()}
                    disabled={isBrewingAnimation}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                  >
                    <RefreshCw className={`w-5 h-5 mr-2 ${isBrewingAnimation ? 'animate-spin' : ''}`} />
                    Surprise Me!
                  </Button>
                </div>
              </div>
            </div>

            {/* Generated Prompt Display */}
            <div className="space-y-6">
              {isBrewingAnimation ? (
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 text-center">
                  <div className="animate-spin w-12 h-12 mx-auto mb-4">
                    <Sparkles className="w-12 h-12 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Brewing Your Design...</h3>
                  <p className="text-purple-200">The mystical forces are conjuring something special just for you...</p>
                </div>
              ) : currentPrompt ? (
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${getDifficultyColor(currentPrompt.difficulty)}`}>
                      {currentPrompt.difficulty}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">{currentPrompt.title}</h3>

                  <p className="text-purple-200 text-lg leading-relaxed mb-6">
                    {currentPrompt.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentPrompt.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-800/50 text-purple-200 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-purple-300">
                      Earn <span className="text-orange-400 font-bold">{currentPrompt.phantomPoints} 👻 Phantom Points</span>
                    </div>

                    <div className="space-x-3">
                      <Button
                        onClick={() => brewNewDesign()}
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-800/30"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Brew Again
                      </Button>

                      <Button
                        onClick={startDesignWithPrompt}
                        className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-semibold"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Start This Design
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white mb-4">Ready to Brew Some Magic?</h3>
                  <p className="text-purple-200">
                    Choose your courage level and let the Enchanted Design Cauldron create the perfect Halloween prompt for you!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};