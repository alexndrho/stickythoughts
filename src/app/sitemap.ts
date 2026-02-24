import type { MetadataRoute } from 'next';

import { getBaseUrl } from '@/lib/seo/base-url.server';
import { listLettersForSitemap } from '@/server/letter/letters';
import { listUsersForSitemap } from '@/server/user/user-profile';

export const revalidate = 86400; // daily

const LETTERS_IN_SITEMAP = 5000;
const USERS_IN_SITEMAP = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const today = new Date();

  let letters: Array<{ id: string; updatedAt: Date | null; createdAt: Date }> = [];
  let users: Array<{
    username: string;
    updatedAt: Date | null;
    createdAt: Date;
  }> = [];
  try {
    const [lettersRes, usersRes] = await Promise.allSettled([
      listLettersForSitemap({ take: LETTERS_IN_SITEMAP }),
      listUsersForSitemap({ take: USERS_IN_SITEMAP }),
    ]);

    if (lettersRes.status === 'fulfilled') {
      letters = lettersRes.value;
    } else {
      console.error('Sitemap: failed to load letters; continuing with static-only letters.', {
        error: lettersRes.reason,
      });
    }

    if (usersRes.status === 'fulfilled') {
      users = usersRes.value;
    } else {
      console.error('Sitemap: failed to load users; continuing with static-only users.', {
        error: usersRes.reason,
      });
    }
  } catch (error) {
    console.error('Sitemap: failed to load data; falling back to static.', {
      error,
    });
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: new URL('/', base).toString(),
      lastModified: today,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: new URL('/letters', base).toString(),
      lastModified: today,
      changeFrequency: 'daily',
      priority: 0.9,
    },

    {
      url: new URL('/about', base).toString(),
      lastModified: new Date('2026-01-21'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: new URL('/contact', base).toString(),
      lastModified: new Date('2023-11-22'),
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: new URL('/terms-and-conditions', base).toString(),
      lastModified: new Date('2026-01-21'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: new URL('/privacy-policy', base).toString(),
      lastModified: new Date('2026-01-21'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: new URL('/disclaimer', base).toString(),
      lastModified: new Date('2026-01-21'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const letterEntries: MetadataRoute.Sitemap = letters.map((letter) => ({
    url: new URL(`/letters/${letter.id}`, base).toString(),
    lastModified: letter.updatedAt ?? letter.createdAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const userEntries: MetadataRoute.Sitemap = users.map((user) => ({
    url: new URL(`/user/${user.username}`, base).toString(),
    lastModified: user.updatedAt ?? user.createdAt,
    changeFrequency: 'weekly',
    priority: 0.4,
  }));

  return [...staticEntries, ...letterEntries, ...userEntries];
}
