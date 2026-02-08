// User service - user CRUD and auth logic
export const userService = {
  async findByEmail(email: string) {
    // Implement find user by email
    return null;
  },

  async create(data: { email: string; password: string }) {
    // Implement user creation
    return { id: '', email: data.email };
  },
};
