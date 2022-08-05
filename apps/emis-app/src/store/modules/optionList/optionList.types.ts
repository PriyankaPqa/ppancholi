import { IOptionItem, EOptionLists } from '@libs/entities-lib/optionItem';

export type IState = {
  items: IOptionItem[];
  list: EOptionLists;
};
