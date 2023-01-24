import {
  ICaseFileCombined, ICaseFileEntity, mockCaseFileEntity, mockCombinedCaseFiles, mockCaseFileActivities, mockCaseFileDetailedCount, mockCaseFileCount,
} from '@libs/entities-lib/case-file';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/household';
import { BaseMock } from '../base/base.mock';
import { IStorageMock } from './storage.types';

export class CaseFileStorageMock extends BaseMock<ICaseFileCombined, ICaseFileEntity> implements IStorageMock {
  constructor() {
    super(mockCombinedCaseFiles(), mockCaseFileEntity());
  }

  protected getters = {
    ...this.baseGetters,
    tagsOptions: jest.fn(),
    inactiveReasons: jest.fn(),
    closeReasons: jest.fn(),
    screeningIds: jest.fn(),
  };

  protected actions = {
    ...this.baseActions,
    fetchTagsOptions: jest.fn(),
    fetchInactiveReasons: jest.fn(() => mockOptionItemData()),
    fetchScreeningIds: jest.fn(() => mockOptionItemData()),
    fetchCloseReasons: jest.fn(() => mockOptionItemData()),
    fetchCaseFileActivities: jest.fn(() => mockCaseFileActivities()),
    fetchCaseFileAssignedCounts: jest.fn(() => mockCaseFileCount()),
    fetchCaseFileDetailedCounts: jest.fn(() => mockCaseFileDetailedCount()),
    setCaseFileTags: jest.fn(() => this.entity),
    setCaseFileStatus: jest.fn(() => this.entity),
    setCaseFileLabels: jest.fn(() => this.entity),
    setCaseFileIsDuplicate: jest.fn(() => this.entity),
    setCaseFileTriage: jest.fn(() => this.entity),
    setCaseFileAssign: jest.fn(() => this.entity),
    createCaseFile: jest.fn(() => mockDetailedRegistrationResponse()),
    setCaseFileIdentityAuthentication: jest.fn(() => this.entity),
    setCaseFileValidationOfImpact: jest.fn(() => this.entity),
    assignCaseFile: jest.fn(() => this.entity),
  };

  protected mutations = {
    ...this.baseMutations,
    setTagsOptionsFetched: jest.fn(),
    setInactiveReasonsFetched: jest.fn(),
    setScreeningIdsFetched: jest.fn(),
    setCloseReasonsFetched: jest.fn(),
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
