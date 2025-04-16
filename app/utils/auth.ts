export const checkAuth = (username: string, password: string) => {
  // In a real app, you'd check against a database or use an auth service
  return username === 'admin' && password === 'password';
}

