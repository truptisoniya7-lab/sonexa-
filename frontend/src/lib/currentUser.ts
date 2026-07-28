export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export const getCurrentUser = (): User => {
  // Temporary mock user until real auth is integrated into the client
  let id = '1';
  let name = 'You (Guest)';
  
  if (typeof window !== 'undefined') {
    const storedId = localStorage.getItem('mock_user_id');
    if (storedId) {
      id = storedId;
    } else {
      id = Math.random().toString(36).substring(7);
      localStorage.setItem('mock_user_id', id);
    }
    
    const storedName = localStorage.getItem('mock_user_name');
    if (storedName) {
      name = storedName;
    } else {
      name = `Guest_\${id.substring(0, 4)}`;
      localStorage.setItem('mock_user_name', name);
    }
  }

  return {
    id,
    name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=\${id}`
  };
};
