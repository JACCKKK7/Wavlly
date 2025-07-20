import { User, Post } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'sarah_designer',
    email: 'sarah@example.com',
    fullName: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    bio: '🎨 UI/UX Designer | Creating beautiful digital experiences',
    followers: 1234,
    following: 567,
    createdAt: '2023-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'mike_dev',
    email: 'mike@example.com',
    fullName: 'Mike Chen',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    bio: '💻 Full-stack developer | Coffee enthusiast ☕',
    followers: 892,
    following: 234,
    createdAt: '2023-02-20T14:15:00Z'
  },
  {
    id: '3',
    username: 'emma_photo',
    email: 'emma@example.com',
    fullName: 'Emma Williams',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    bio: '📸 Travel photographer | Capturing moments around the world',
    followers: 2156,
    following: 789,
    createdAt: '2023-03-10T09:45:00Z'
  }
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'Just finished designing a new mobile app interface! The color palette really makes a difference. What do you think about using gradients in modern UI design? 🎨✨',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    likes: 47,
    comments: 12,
    isLiked: false,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'Debugging late into the night again... but there\'s something satisfying about solving complex problems. Any other night owl developers out there? 🦉💻',
    likes: 23,
    comments: 8,
    isLiked: true,
    createdAt: '2024-01-14T23:15:00Z'
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Golden hour at the beach never gets old. Sometimes you just need to step away from the city and breathe. Nature is the best therapy! 🌅🏖️',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    likes: 156,
    comments: 24,
    isLiked: false,
    createdAt: '2024-01-14T18:20:00Z'
  },
  {
    id: '4',
    author: mockUsers[0],
    content: 'Working on some new icon designs today. The smallest details can make the biggest impact in user experience. Pixel perfect is the goal! 🎯',
    likes: 89,
    comments: 15,
    isLiked: true,
    createdAt: '2024-01-13T16:45:00Z'
  }
];