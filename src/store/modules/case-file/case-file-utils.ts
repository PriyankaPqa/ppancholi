import { ActionContext } from 'vuex';
import {
  ECaseFileStatus,
  ECaseFileTriage,
  ICaseFile,
  ICaseFileBeneficiary,
  ICaseFileData,
  ICaseFileSearchData,
} from '@/entities/case-file';

import { IOptionItem } from '@/entities/optionItem';
import { IIdMultilingualName, IListOption, IMultilingual } from '@/types';
import helpers from '@/ui/helpers';
import utils from '@/entities/utils';
import { IRootState } from '../../store.types';
import { IState } from './case-file.types';

const getTriageName = (triage: ECaseFileTriage) : IMultilingual => {
  const triageName = helpers.fillAllTranslationsFromI18n(`enums.Triage.${ECaseFileTriage[triage]}`);
  return triageName;
};

const getCaseFileStatusName = (status: ECaseFileStatus) : IMultilingual => {
  const statusName = helpers.fillAllTranslationsFromI18n(`caseFile.status.${ECaseFileStatus[status]}`);
  return statusName;
};

const getBeneficiary = (originalCaseFile: ICaseFile, beneficiaryId: uuid): ICaseFileBeneficiary => {
  if (originalCaseFile && originalCaseFile.beneficiary.id === beneficiaryId) {
    return originalCaseFile.beneficiary;
  }
  return null;
};

const getEvent = (originalCaseFile: ICaseFile, eventId: uuid): IIdMultilingualName => {
  if (originalCaseFile && originalCaseFile.event.id === eventId) {
    return originalCaseFile.event;
  }
  return null;
};

const getTags = (originalCaseFile: ICaseFile, tags: IListOption[], tagOptions: IOptionItem[]): IIdMultilingualName[] => {
  const caseFileTags: IIdMultilingualName[] = [];

  tags.forEach((tag: IListOption) => {
    const originalTag: IIdMultilingualName = originalCaseFile?.tags && originalCaseFile.tags
      .find((t: IIdMultilingualName) => t.id === tag.optionItemId);

    if (originalTag) {
      caseFileTags.push({
        id: originalTag.id,
        name: utils.initMultilingualAttributes(originalTag.name),
      });
    } else {
      const tagOption: IOptionItem = tagOptions.find((t) => t.id === tag.optionItemId);
      if (tagOption) {
        caseFileTags.push({
          id: tagOption.id,
          name: utils.initMultilingualAttributes(tagOption.name),
        });
      }
    }
  });

  return caseFileTags;
};

export const mapCaseFileDataToSearchData = (
  caseFileData: ICaseFileData,
  context: ActionContext<IState, IRootState>,
  originalCaseFileId: uuid,
) : ICaseFileSearchData => {
  const originalCaseFile = context.state.caseFiles.find((e) => e.id === originalCaseFileId);

  return {
    caseFileId: caseFileData.id,
    beneficiary: getBeneficiary(originalCaseFile, caseFileData.beneficiaryId),
    caseFileCreatedDate: caseFileData.created,
    caseFileNumber: caseFileData.caseFileNumber,
    caseFileStatus: caseFileData.caseFileStatus,
    caseFileStatusName: getCaseFileStatusName(caseFileData.caseFileStatus),
    isDuplicate: caseFileData.isDuplicate,
    event: getEvent(originalCaseFile, caseFileData.eventId),
    tags: getTags(originalCaseFile, caseFileData.tags, context.state.tagsOptions),
    labels: caseFileData.labels.map((l) => ({ ...l })),
    timestamp: caseFileData.timestamp,
    triage: caseFileData.triage,
    triageName: getTriageName(caseFileData.triage),
    tenantId: null,
  };
};
