'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Trash2, Edit, Send, Loader2 } from 'lucide-react';
import { getPlatformDisplayName, getStatusColor, canDeletePost, canEditPost, canPostNow } from '@/lib/autopilot/social-helpers';

interface SocialPost {
  id: string;
  platform: string;
  post_content: string;
  status: string;
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
  platform_post_url: string | null;
}

export function SocialPostsList({ onEdit }: { onEdit?: (post: SocialPost) => void }) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'posted'>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | string>('all');

  useEffect(() => {
    fetchPosts();
  }, [filter, platformFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (platformFilter !== 'all') params.set('platform', platformFilter);

      const response = await fetch(`/api/autopilot/social/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.posts);
      } else {
        setError(data.message || 'Failed to load posts');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/autopilot/social/posts/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        fetchPosts();
      } else {
        alert(data.message || 'Failed to delete post');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    }
  };

  const handlePostNow = async (id: string) => {
    try {
      const response = await fetch(`/api/autopilot/social/posts/${id}/post-now`, { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        fetchPosts();
        alert('Post published successfully!');
      } else {
        alert(data.message || 'Failed to publish post');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="posted">Posted</option>
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Platforms</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="twitter">Twitter</option>
        </select>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          No posts found. Create your first post to get started!
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map(post => (
            <Card key={post.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{getPlatformDisplayName(post.platform as any)}</Badge>
                    <Badge style={{ backgroundColor: getStatusColor(post.status as any) }} className="text-white">
                      {post.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                    {post.post_content}
                  </p>

                  <div className="text-xs text-gray-500 space-y-1">
                    {post.scheduled_for && (
                      <p>Scheduled: {new Date(post.scheduled_for).toLocaleString()}</p>
                    )}
                    {post.posted_at && (
                      <p>Posted: {new Date(post.posted_at).toLocaleString()}</p>
                    )}
                    {post.platform_post_url && (
                      <a href={post.platform_post_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View on {getPlatformDisplayName(post.platform as any)}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {canPostNow(post.status as any) && (
                    <Button size="sm" onClick={() => handlePostNow(post.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  {canEditPost(post.status as any) && onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeletePost(post.status as any) && (
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
