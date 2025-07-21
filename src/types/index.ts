export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  bio: string;
  followers: number | any[]; // Can be count or array
  following: number | any[]; // Can be count or array
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isFollowing?: boolean;
  isVerified?: boolean;
  joinDate?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  _id: string;
  type: 'like' | 'comment' | 'follow';
  message: string;
  read: boolean;
  createdAt: string;
  from: {
    _id: string;
    id: string;
    username: string;
    fullName: string;
    avatar: string;
  };
  post?: {
    _id: string;
    id: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}