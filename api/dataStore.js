// This is a simple in-memory store for serverless functions
// NOTE: Data will reset on each deployment and function cold start
// For production, use Vercel KV, Postgres, or another persistent database

let users = [];

export function getUsers() {
  return users;
}

export function addUser(user) {
  users.push(user);
  return user;
}

export function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

export function findUserById(id) {
  return users.find(u => u.id === id);
}

export function updateUserReferrals(id) {
  const user = users.find(u => u.id === id);
  if (user) {
    user.referrals = (user.referrals || 0) + 1;
  }
  return user;
}
