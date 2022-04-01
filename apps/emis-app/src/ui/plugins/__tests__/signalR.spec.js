import { mockStorage } from '@/store/storage';
import { SignalR } from '@/ui/plugins/signalR';

const storage = mockStorage();

const listenForChangesFct = SignalR.prototype.listenForChanges;
const listenForOptionItemChangesFct = SignalR.prototype.listenForOptionItemChanges;
SignalR.prototype.buildHubConnection = jest.fn();
SignalR.prototype.listenForChanges = jest.fn();
SignalR.prototype.listenForOptionItemChanges = jest.fn();

let conn = new SignalR({ storage, showConsole: false });

describe('signalR', () => {
  beforeEach(() => {
    conn = new SignalR({ storage, showConsole: false });
    conn.connection = { on: jest.fn() };
  });
  describe('createBindings', () => {
    it('calls listenForEventModuleChanges', () => {
      conn.listenForEventModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForEventModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForProgramModuleChanges', () => {
      conn.listenForProgramModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForProgramModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForCaseFileModuleChanges', () => {
      conn.listenForCaseFileModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseFileModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForCaseNoteModuleChanges', () => {
      conn.listenForCaseNoteModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseNoteModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForCaseReferralModuleChanges', () => {
      conn.listenForCaseReferralModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseReferralModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForCaseDocumentModuleChanges', () => {
      conn.listenForCaseDocumentModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForCaseDocumentModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForFinancialAssistancePaymentModuleChanges', () => {
      conn.listenForFinancialAssistancePaymentModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForFinancialAssistancePaymentModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForFinancialAssistanceModuleChanges', () => {
      conn.listenForFinancialAssistanceModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForFinancialAssistanceModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForFinancialAssistanceCategoryModuleChanges', () => {
      conn.listenForFinancialAssistanceCategoryModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForFinancialAssistanceCategoryModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForHouseholdModuleChanges', () => {
      conn.listenForHouseholdModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForHouseholdModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForTeamModuleChanges', () => {
      conn.listenForTeamModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForTeamModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForUserAccountModuleChanges', () => {
      conn.listenForUserAccountModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForUserAccountModuleChanges).toHaveBeenCalled();
    });

    it('calls listenForMassActionsModuleChanges', () => {
      conn.listenForMassActionsModuleChanges = jest.fn();
      conn.createBindings();
      expect(conn.listenForMassActionsModuleChanges).toHaveBeenCalled();
    });

    it('calls massActionNotifications', () => {
      conn.massActionNotifications = jest.fn();
      conn.createBindings();
      expect(conn.massActionNotifications).toHaveBeenCalled();
    });
  });

  describe('listenForHouseholdModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForHouseholdModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'Household',
        action: conn.storage.household.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'HouseholdMetadata',
        action: conn.storage.household.mutations.setMetadataFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'Person',
        action: conn.noAction,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'PersonMetadata',
        action: conn.noAction,
      });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForHouseholdModuleChanges();
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'household',
        optionItemName: 'ScreeningId',
        cacheResetMutationName: 'setScreeningIdsFetched',
        mutationDomain: 'caseFile',
      });
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'household',
        optionItemName: 'Gender',
        cacheResetMutationName: 'setGendersFetched',
        mutationDomain: 'registration',
      });
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'household',
        optionItemName: 'PrimarySpokenLanguage',
        cacheResetMutationName: 'setPrimarySpokenLanguagesFetched',
        mutationDomain: 'registration',
      });
    });
  });

  describe('listenForHouseholdModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForHouseholdModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'Household',
        action: conn.storage.household.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'HouseholdMetadata',
        action: conn.storage.household.mutations.setMetadataFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'Person',
        action: conn.noAction,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'household',
        entityName: 'PersonMetadata',
        action: conn.noAction,
      });
    });
  });

  describe('listenForProgramModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForProgramModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'event',
        entityName: 'Program',
        action: conn.storage.program.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'event',
        entityName: 'ProgramMetadata',
        action: conn.storage.program.mutations.setMetadataFromOutsideNotification,
      });
    });
  });

  describe('listenForUserAccountModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForUserAccountModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'user-account',
        entityName: 'UserAccount',
        action: conn.storage.userAccount.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'user-account',
        entityName: 'UserAccountMetadata',
        action: conn.storage.userAccount.mutations.setMetadataFromOutsideNotification,
      });
    });
  });

  describe('listenForEventModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForEventModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'event',
        entityName: 'Event',
        action: conn.storage.event.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'event',
        entityName: 'EventMetadata',
        action: conn.storage.event.mutations.setMetadataFromOutsideNotification,
      });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForEventModuleChanges();
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'event',
        optionItemName: 'AgreementType',
        cacheResetMutationName: 'setAgreementTypesFetched',
      });
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'event',
        optionItemName: 'EventType',
        cacheResetMutationName: 'setEventTypesFetched',
      });
    });
  });

  describe('listenForTeamModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForTeamModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'team',
        entityName: 'Team',
        action: conn.storage.team.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'team',
        entityName: 'TeamMetadata',
        action: conn.storage.team.mutations.setMetadataFromOutsideNotification,
      });
    });
  });

  describe('listenForMassActionsModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForMassActionsModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'MassAction',
        action: conn.storage.massAction.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'MassActionMetadata',
        action: conn.storage.massAction.mutations.setMetadataFromOutsideNotification,
      });
    });
  });

  describe('listenForCaseFileModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseFileModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'CaseFile',
        action: conn.storage.caseFile.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'CaseFileMetadata',
        action: conn.storage.caseFile.mutations.setMetadataFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'CaseFileActivity',
        action: conn.noAction,
      });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseFileModuleChanges();
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'CloseReason',
        cacheResetMutationName: 'setCloseReasonsFetched',
      });
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'InactiveReason',
        cacheResetMutationName: 'setInactiveReasonsFetched',
      });
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'Tag',
        cacheResetMutationName: 'setTagsOptionsFetched',
      });
    });
  });

  describe('listenForCaseNoteModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseNoteModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'CaseNote',
        action: conn.storage.caseNote.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'CaseNoteMetadata',
        action: conn.storage.caseNote.mutations.setMetadataFromOutsideNotification,
      });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseNoteModuleChanges();
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'CaseNoteCategory',
        cacheResetMutationName: 'setCaseNoteCategoriesFetched',
        mutationDomain: 'caseNote',
      });
    });
  });

  describe('listenForCaseReferralModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseReferralModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'Referral',
        action: conn.storage.caseFileReferral.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'ReferralMetadata',
        action: conn.storage.caseFileReferral.mutations.setMetadataFromOutsideNotification,
      });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseReferralModuleChanges();
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'ReferralType',
        cacheResetMutationName: 'setTypesFetched',
        mutationDomain: 'caseFileReferral',
      });
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'ReferralOutcomeStatus',
        cacheResetMutationName: 'setOutcomeStatusesFetched',
        mutationDomain: 'caseFileReferral',
      });
    });
  });

  describe('listenForFinancialAssistancePaymentModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForFinancialAssistancePaymentModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'finance',
        entityName: 'FinancialAssistancePayment',
        action: conn.storage.financialAssistancePayment.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'finance',
        entityName: 'FinancialAssistancePaymentMetadata',
        action: conn.storage.financialAssistancePayment.mutations.setMetadataFromOutsideNotification,
      });
    });
  });

  describe('listenForCaseDocumentModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForCaseDocumentModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'Document',
        action: conn.storage.caseFileDocument.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        entityName: 'DocumentMetadata',
        action: conn.storage.caseFileDocument.mutations.setMetadataFromOutsideNotification,
      });
    });

    it('calls listenForOptionItemChanges', () => {
      conn.listenForCaseDocumentModuleChanges();
      expect(conn.listenForOptionItemChanges).toHaveBeenCalledWith({
        domain: 'case-file',
        optionItemName: 'DocumentCategory',
        cacheResetMutationName: 'setCategoriesFetched',
        mutationDomain: 'caseFileDocument',
      });
    });
  });

  describe('listenForFinancialAssistanceModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForFinancialAssistanceModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'finance',
        entityName: 'FinancialAssistanceTable',
        action: conn.storage.financialAssistance.mutations.setEntityFromOutsideNotification,
      });
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'finance',
        entityName: 'FinancialAssistanceTableMetadata',
        action: conn.storage.financialAssistance.mutations.setMetadataFromOutsideNotification,
      });
    });
  });

  describe('listenForFinancialAssistanceCategoryModuleChanges', () => {
    it('calls listenForChanges', () => {
      conn.listenForFinancialAssistanceCategoryModuleChanges();
      expect(conn.listenForChanges).toHaveBeenCalledWith({
        domain: 'finance',
        entityName: 'FinancialAssistanceCategory',
        action: conn.storage.financialAssistanceCategory.mutations.setEntityFromOutsideNotification,
      });
    });
  });

  describe('listenForChanges', () => {
    it('attaches the action to the connection', () => {
      SignalR.prototype.listenForChanges = listenForChangesFct;
      conn = new SignalR({ storage, showConsole: false });
      conn.connection = { on: jest.fn() };
      conn.listenForChanges({ domain: 'financialAssistance', entityName: 'FinancialAssistanceCategory' });
      expect(conn.connection.on).toHaveBeenCalledWith('financialAssistance.FinancialAssistanceCategoryUpdated', expect.any(Function));
      expect(conn.connection.on).toHaveBeenCalledWith('financialAssistance.FinancialAssistanceCategoryCreated', expect.any(Function));
    });
  });
  describe('listenForOptionItemChanges', () => {
    it('attaches the action to the connection', () => {
      SignalR.prototype.listenForOptionItemChanges = listenForOptionItemChangesFct;
      conn = new SignalR({ storage, showConsole: false });
      conn.connection = { on: jest.fn() };
      conn.listenForOptionItemChanges({
        domain: 'event',
        optionItemName: 'AgreementType',
        cacheResetMutationName: 'setAgreementTypesFetched',
      });
      expect(conn.connection.on).toHaveBeenCalledWith('event.AgreementTypeUpdated', expect.any(Function));
      expect(conn.connection.on).toHaveBeenCalledWith('event.AgreementTypeCreated', expect.any(Function));
    });
  });
});
