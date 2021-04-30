import { IProgramSearchData } from '@/entities/program';

export type IState = {
  programs: IProgramSearchData[];
  programLoading: boolean;
};
