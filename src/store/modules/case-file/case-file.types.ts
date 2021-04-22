import { ICaseFile } from '@/entities/case-file';

export type IState = {
  caseFiles: Array<ICaseFile>,
  getLoading: boolean,
  searchLoading: boolean,
};
