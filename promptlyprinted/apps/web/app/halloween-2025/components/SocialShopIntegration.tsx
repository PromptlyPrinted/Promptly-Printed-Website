'use client';

import { Instagram, Share2, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@repo/design-system/components/ui/button';

export const SocialShopIntegration = () => {
  const handleSocialShare = (platform: string) => {
    // Award phantom points for social sharing
    if (typeof window !== 'undefined' && (window as any).addPhantomPoints) {
      (window as any).addPhantomPoints('phantomPoints', 50);
    }

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out these amazing custom Halloween designs! 🎃👻');

    const shareUrls: Record<string, string> = {
      instagram: 'https://www.instagram.com/', // Instagram doesn't support direct web sharing
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`,
    };

    if (platform === 'instagram') {
      // For Instagram, show modal with instructions
      alert('📱 Share to Instagram:\n\n1. Screenshot this page\n2. Open Instagram\n3. Share to your Story!\n\nTag us @promptlyprinted for a chance to be featured!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const instagramPosts = [
    {
      id: 1,
      image: "🎃",
      likes: 342,
      comments: 28,
      username: "@spooky_sarah",
      caption: "Obsessed with my custom Halloween hoodie! 👻",
    },
    {
      id: 2,
      image: "👹",
      likes: 589,
      comments: 45,
      username: "@halloween_marcus",
      caption: "The AI design tool is INSANE! 🔥",
    },
    {
      id: 3,
      image: "🦇",
      likes: 421,
      comments: 32,
      username: "@costume_queen",
      caption: "Squad goals achieved! 🎃✨",
    },
    {
      id: 4,
      image: "💀",
      likes: 756,
      comments: 61,
      username: "@trick_or_treat_james",
      caption: "Best quality I've ever seen! 👏",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0f1419] to-[#1a0b2e]">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-pink-600/20 to-purple-600/20 border border-pink-500/30 px-4 py-2 rounded-full mb-4">
            <span className="text-pink-400 font-bold">📸 SOCIAL SHOWCASE</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join the <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">#HalloweenDesign</span> Community
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Share your creation for a chance to be featured and win £50 in design credits!
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {instagramPosts.map((post) => (
            <div
              key={post.id}
              className="group relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 rounded-2xl p-4 hover:border-pink-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Post Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-pink-600/20 to-purple-700/20 rounded-xl flex items-center justify-center text-8xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {post.image}
              </div>

              {/* Post Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-pink-400 hover:text-pink-300 transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-semibold">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">{post.comments}</span>
                    </button>
                  </div>
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>

                <div className="text-white font-semibold text-sm">{post.username}</div>
                <p className="text-purple-300 text-sm line-clamp-2">{post.caption}</p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/90 to-purple-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-2xl">
                <Button
                  onClick={() => handleSocialShare('instagram')}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-bold"
                >
                  <Instagram className="w-5 h-5 mr-2" />
                  Shop This Look
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Share CTA */}
        <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">
              Share Your Halloween Creation & Get Featured!
            </h3>
            <p className="text-purple-200 text-lg">
              Tag us on social media for a chance to win £50 in design credits + be featured on our page
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => handleSocialShare('instagram')}
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold"
            >
              <Instagram className="w-5 h-5 mr-2" />
              Share on Instagram
            </Button>
            <Button
              onClick={() => handleSocialShare('facebook')}
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share on Facebook
            </Button>
            <Button
              onClick={() => handleSocialShare('twitter')}
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share on Twitter
            </Button>
            <Button
              onClick={() => handleSocialShare('pinterest')}
              size="lg"
              variant="outline"
              className="border-purple-500 text-purple-300 hover:bg-purple-900/30"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Pin It
            </Button>
          </div>

          {/* Hashtags */}
          <div className="mt-8 text-center">
            <p className="text-purple-300 mb-3">Use these hashtags:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['#HalloweenDesign', '#PromptlyPrinted', '#CustomHalloween', '#SpookyStyle'].map((tag) => (
                <span
                  key={tag}
                  className="bg-purple-900/30 border border-purple-500/30 px-4 py-2 rounded-full text-pink-400 font-semibold text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reward Badge */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-yellow-400/10 border border-yellow-400/30 px-6 py-3 rounded-full">
              <span className="text-yellow-400 font-bold">
                🏆 Get +50 👻 Phantom Points for every share!
              </span>
            </div>
          </div>
        </div>

        {/* Instagram Shop CTA */}
        <div className="mt-12 text-center">
          <p className="text-purple-300 mb-4">
            ✨ Follow us on Instagram for exclusive designs & giveaways
          </p>
          <a
            href="https://www.instagram.com/promptlyprinted"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Instagram className="w-5 h-5" />
            @promptlyprinted
          </a>
        </div>
      </div>
    </section>
  );
};
