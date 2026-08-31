import React from 'react';
import { Instagram, Music2, ExternalLink, Heart, Play } from 'lucide-react';
import { BrandSettings } from '../../types';
import { handleImageError, getOptimizedImageUrl } from '../../utils/imageFallback';

interface SocialShowcaseProps {
  settings: BrandSettings;
}

export const SocialShowcase: React.FC<SocialShowcaseProps> = ({ settings }) => {
  const posts = [
    {
      type: 'reel',
      title: 'Kanjivaram Silk Pleating Tutorial',
      handle: settings.tiktokHandle,
      likes: '4.2k',
      image: '/src/assets/images/meera_hero_model_1788152289614.jpg',
      url: settings.tiktokUrl,
      platform: 'TikTok',
    },
    {
      type: 'photo',
      title: 'Classical Bharatanatyam Dance Draping',
      handle: settings.instagramHandle,
      likes: '3.8k',
      image: '/src/assets/images/meera_performance_set_1788152305062.jpg',
      url: settings.instagramUrl,
      platform: 'Instagram',
    },
    {
      type: 'photo',
      title: 'Kundan Bangle Stacks & Size Guide',
      handle: settings.instagramHandle,
      likes: '2.9k',
      image: '/src/assets/images/meera_jewellery_bangles_1788152322855.jpg',
      url: settings.instagramUrl,
      platform: 'Instagram',
    },
    {
      type: 'reel',
      title: 'Bridal Raw Silk Lehenga Reveal',
      handle: settings.tiktokHandle,
      likes: '5.1k',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=450&q=70',
      url: settings.tiktokUrl,
      platform: 'TikTok',
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-rose-100">
          <div>
            <span className="text-xs font-bold tracking-[0.25em] text-[#9E315A] uppercase font-display">
              Social Community
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#241B20] mt-1">
              Follow {settings.brandName || 'Meera Fashion'}
            </h2>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#FFF0F5] hover:bg-[#F8DDE7] text-[#9E315A] px-4 py-2 rounded-full text-xs font-bold transition-colors border border-rose-200"
            >
              <Music2 className="w-4 h-4" />
              <span>TikTok {settings.tiktokHandle}</span>
            </a>
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9E315A] hover:bg-[#C94F7C] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors shadow-sm"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram {settings.instagramHandle}</span>
            </a>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {posts.map((post, idx) => (
            <a
              key={idx}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shadow-2xs hover:shadow-luxury transition-all duration-300 flex flex-col justify-end p-4"
            >
              <img
                src={getOptimizedImageUrl(post.image, { width: 450, quality: 70 })}
                alt={post.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, 'saree')}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Badge top right */}
              <div className="absolute top-3 right-3 glass-dark text-white p-1.5 rounded-full">
                {post.platform === 'TikTok' ? (
                  <Music2 className="w-3.5 h-3.5" />
                ) : (
                  <Instagram className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Play icon if reel */}
              {post.type === 'reel' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              )}

              {/* Content Bottom */}
              <div className="relative z-10 text-white">
                <p className="text-xs font-semibold line-clamp-1">{post.title}</p>
                <div className="flex items-center justify-between text-[10px] text-rose-200 mt-1">
                  <span>{post.handle}</span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-rose-300" />
                    {post.likes}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};
