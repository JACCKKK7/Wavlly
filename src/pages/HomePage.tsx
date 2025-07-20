import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { CreatePost } from '../components/feed/CreatePost';
import { PostCard } from '../components/feed/PostCard';
import { UserProfile } from '../components/sidebar/UserProfile';
import { TrendingTopics } from '../components/sidebar/TrendingTopics';
import { SuggestedUsers } from '../components/sidebar/SuggestedUsers';
import { mockPosts } from '../data/mockData';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    console.log('Opening comments for post:', postId);
  };

  const handlePostCreate = (content: string, image?: string) => {
    if (!user) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      author: user,
      content,
      image,
      likes: 0,
      comments: 0,
      isLiked: false,
      createdAt: new Date().toISOString()
    };

    setPosts(prev => [newPost, ...prev]);
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
            
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))}
            </div>
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