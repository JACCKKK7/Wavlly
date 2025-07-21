const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('wavvly_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    return this.handleResponse(response);
  }

  async register(userData: { username: string; email: string; fullName: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Posts endpoints
  async getPosts(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async createPost(content: string, images?: string[]) {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content, images })
    });
    const data = await this.handleResponse(response);
    return data.post;
  }

  async likePost(id: string) {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    return { 
      isLiked: data.liked,
      likes: data.likeCount
    };
  }

  async commentOnPost(id: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/comment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return this.handleResponse(response);
  }

  async deletePost(id: string) {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getUserPosts(userId: string, page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/posts/user/${userId}?page=${page}&limit=${limit}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Users endpoints
  async getSuggestedUsers() {
    const response = await fetch(`${API_BASE_URL}/users/suggested`, {
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    return data.users || [];
  }

  async getUserProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async followUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async unfollowUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/unfollow`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async searchUsers(query: string) {
    const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFollowers(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/followers`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async getFollowing(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/following`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Upload endpoints
  async uploadFile(file: File, type: 'avatar' | 'post') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('wavvly_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  // Notifications endpoints
  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Analytics endpoints (admin only)
  async getAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();