import { IOptionItem, EOptionLists } from '@/entities/optionItem';

export type IState = {
  items: IOptionItem[];
  list: EOptionLists;
};
