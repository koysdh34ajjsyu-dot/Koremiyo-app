import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'https://koremiyo-anime.online';

export default async function sitemap() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
  const staticRoutes = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/ranking`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/campaign`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/dlsite`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/dmm`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/ranking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/campaign`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/dlsite`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  let postRoutes = [];
  if (supabase) {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, site, created_at')
        .order('created_at', { ascending: false });

      if (posts) {
        postRoutes = posts.map((post) => {
          const section = post.site === 'dmm' ? 'dmm' : 'dlsite';
          return {
            url: `${BASE_URL}/${section}/${post.id}`,
            lastModified: new Date(post.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.8,
          };
        });
      }
    } catch (e) {
      console.error('Error fetching posts for sitemap:', e);
    }
  }

  let campaignRoutes = [];
  if (supabase) {
    try {
      const { data: camps } = await supabase
        .from('campaigns')
        .select('id, updated_at, created_at')
        .eq('is_active', true);

      if (camps) {
        campaignRoutes = camps.map((camp) => ({
          url: `${BASE_URL}/campaign/${camp.id}`,
          lastModified: new Date(camp.updated_at || camp.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }
    } catch (e) {
      console.error('Error fetching campaigns for sitemap:', e);
    }
  }

  return [...staticRoutes, ...postRoutes, ...campaignRoutes];
}
