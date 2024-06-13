import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { IListOption } from '@libs/shared-lib/src/types';
import { CaseFileStatusUpdateReason } from '@libs/cypress-lib/helpers';

export interface IMockSetCaseFileStatusToRequestParam {
  status: CaseFileStatus;
  reason: IListOption;
  rationale: string;
}

export const mockSetCaseFileStatusRequest = (status: CaseFileStatus): IMockSetCaseFileStatusToRequestParam => {
  let reasonOptionItemId = '';
  switch (status) {
    case CaseFileStatus.Closed:
      reasonOptionItemId = CaseFileStatusUpdateReason.Close;
      break;

    case CaseFileStatus.Inactive:
      reasonOptionItemId = CaseFileStatusUpdateReason.Inactive;
      break;

    default:
      reasonOptionItemId = '';
  }

  return {
    status,
    reason: {
      optionItemId: reasonOptionItemId,
      specifiedOther: null,
    },
    rationale: 'test rationale',
  };
};

export const mockAddTagToCaseFileRequest = (tagId: string): IListOption => ({
  optionItemId: tagId,
  specifiedOther: null,
});
