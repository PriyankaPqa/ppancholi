import { IUser, IUserData } from '@/entities/user';
import {
  ActionContext, GetterTree, Store, MutationTree,
} from 'vuex';
import { IRootState } from '../../store.types';

export type IState = IUserData;

export interface IGetters extends GetterTree<IState, IRootState> {
  user(state: IState): IUser;
}

export interface IMutations extends MutationTree<IState> {
  setUser(this: Store<IState>, state: IState, payload: IUserData): void;
}

export interface IActions {
  signOut(this: Store<IState>): Promise<void>;
  fetchUserData(this: Store<IState>, context: ActionContext<IState, IState>): void;
}
