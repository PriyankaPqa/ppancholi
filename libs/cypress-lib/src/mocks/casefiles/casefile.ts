import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { IListOption } from '@libs/shared-lib/src/types';

export interface IMockSetCaseFileStatusToRequestParam {
  status: CaseFileStatus;
  reason: IListOption;
  rationale: string;
}

export const mockSetCaseFileStatusRequest = (status: CaseFileStatus): IMockSetCaseFileStatusToRequestParam => ({
  status,
  reason: {
    optionItemId: '1a643139-3983-496f-9201-283f01bd5651',
    specifiedOther: null,
  },
  rationale: 'test rationale',
});

export const mockAddTagToCaseFileRequest = (tagId: string): IListOption => ({
  optionItemId: tagId,
  specifiedOther: null,
});
