
export const userService = {
  async findByEmail(email: string) {

    return null;
  },

  async create(data: { email: string; password: string }) {
    return { id: '', email: data.email };
  },
};
