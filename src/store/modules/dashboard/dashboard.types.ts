import { Store, MutationTree } from 'vuex';

export interface IState {
  leftMenuExpanded: boolean;
  leftMenuVisible: boolean;
  rightMenuVisible: boolean;
  generalHelpMenuVisible: boolean;
}

export interface IMutations extends MutationTree<IState> {
  setProperty(this: Store<IState>, state: IState, { property, value }: {property: keyof IState, value: boolean }): void;
}
