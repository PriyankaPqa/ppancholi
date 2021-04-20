import { ICaseFile } from '@/entities/case-file';

export type IState = {
  caseFiles: Array<ICaseFile>,
  searchLoading: boolean,
};
