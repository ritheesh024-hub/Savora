import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Savora | Premium Fast Food Cafe',
    short_name: 'Savora',
    description: 'Experience premium fast food redefined. Quality, speed, and taste unified in one perfect bite.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ff6600',
    orientation: 'portrait',
    icons: [
      {
        src: 'https://placehold.co/192x192/ff6600/ffffff?text=S',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512/ff6600/ffffff?text=S',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Explore Menu',
        url: '/menu',
        icons: [{ src: 'https://placehold.co/96x96/ff6600/ffffff?text=Menu', sizes: '96x96' }]
      },
      {
        name: 'Track Orders',
        url: '/orders',
        icons: [{ src: 'https://placehold.co/96x96/ff6600/ffffff?text=Track', sizes: '96x96' }]
      }
    ]
  };
}
