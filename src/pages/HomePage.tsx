import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { CreatePost } from '../components/feed/CreatePost';
import { PostCard } from '../components/feed/PostCard';
import { UserProfile } from '../components/sidebar/UserProfile';
import { TrendingTopics } from '../components/sidebar/TrendingTopics';
import { SuggestedUsers } from '../components/sidebar/SuggestedUsers';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await apiService.getPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await apiService.likePost(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: response.isLiked,
              likes: response.likes
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    console.log('Opening comments for post:', postId);
  };

  const handlePostCreate = async (content: string, image?: string) => {
    try {
      const newPost = await apiService.createPost(content, image);
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="hidden lg:block space-y-6">
            <UserProfile />
            <TrendingTopics />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-1 space-y-6">
            <CreatePost onPostCreate={handlePostCreate} />
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                  />
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No posts yet. Create your first post!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block space-y-6">
            <SuggestedUsers />
          </div>
        </div>
      </div>
    </div>
  );
}