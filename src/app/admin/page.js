'use client';

import { useState, useEffect } from 'react';
import { AdminDashboard, AppLayoutWrapper } from '../page';
import { supabase } from '../../lib/supabase';

export default function AdminRoute() {
  const [dlsiteArticles, setDlsiteArticles] = useState([]);
  const [dmmArticles, setDmmArticles] = useState([]);

  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (data) {
      setDlsiteArticles(data.filter(post => post.site === 'dlsite'));
      setDmmArticles(data.filter(post => post.site === 'dmm'));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <AppLayoutWrapper>
      <AdminDashboard
        dlsiteArticles={dlsiteArticles}
        dmmArticles={dmmArticles}
        refreshPosts={fetchPosts}
      />
    </AppLayoutWrapper>
  );
}
