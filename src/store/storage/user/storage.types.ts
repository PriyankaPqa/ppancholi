import { IUser, IUserData } from '@/entities/user';

export interface IStorage {
  getters: {
    user(): IUser;
  }

  mutations: {
    setUser(payload: IUserData): void;
  }

  actions: {
    signOut(): void;
    fetchUserData(): void;
  }
}
