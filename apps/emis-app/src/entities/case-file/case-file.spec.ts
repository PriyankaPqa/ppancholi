import {
  mockCaseFileEntity, CaseFileEntity, IdentityAuthenticationMethod, IdentityAuthenticationStatus, ImpactValidationMethod, ValidationOfImpactStatus,
} from './index';

const mockCaseFileData = mockCaseFileEntity();

describe('>>> Case File', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate assignedIndividualIds', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.assignedIndividualIds).toEqual(mockCaseFileData.assignedIndividualIds);
      });

      it('should instantiate assignedTeamMembers', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.assignedTeamMembers).toEqual(mockCaseFileData.assignedTeamMembers);
      });

      it('should instantiate assignedTeamIds', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.assignedTeamIds).toEqual(mockCaseFileData.assignedTeamIds);
      });

      it('should instantiate caseFileNumber', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.caseFileNumber).toEqual(mockCaseFileData.caseFileNumber);
      });

      it('should instantiate caseFileStatus', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.caseFileStatus).toEqual(mockCaseFileData.caseFileStatus);
      });

      it('should instantiate eventId', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.eventId).toEqual(mockCaseFileData.eventId);
      });

      it('should instantiate householdId', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.householdId).toEqual(mockCaseFileData.householdId);
      });

      it('should instantiate isDuplicate', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.isDuplicate).toEqual(mockCaseFileData.isDuplicate);
      });

      it('should instantiate labels', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.labels).toEqual(mockCaseFileData.labels);
      });

      it('should instantiate tags', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.tags).toEqual(mockCaseFileData.tags);
      });

      it('should instantiate triage', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.triage).toEqual(mockCaseFileData.triage);
      });

      it('should instantiate privacyDateTimeConsent', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.privacyDateTimeConsent).toEqual(new Date(mockCaseFileData.privacyDateTimeConsent));
      });
    });

    describe('instantiate when data is not passed', () => {
      it('should instantiate assignedIndividualIds', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.assignedIndividualIds).toEqual([]);
      });

      it('should instantiate assignedIndividualIds', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.assignedIndividualIds).toEqual([]);
      });

      it('should instantiate assignedTeamMembers', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.assignedTeamMembers).toEqual([]);
      });

      it('should instantiate caseFileNumber', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.caseFileNumber).toEqual(null);
      });

      it('should instantiate caseFileStatus', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.caseFileStatus).toEqual(null);
      });

      it('should instantiate eventId', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.eventId).toEqual(null);
      });

      it('should instantiate householdId', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.householdId).toEqual(null);
      });

      it('should instantiate isDuplicate', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.isDuplicate).toEqual(false);
      });

      it('should instantiate labels', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.labels).toEqual([]);
      });

      it('should instantiate tags', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.tags).toEqual([]);
      });

      it('should instantiate triage', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.triage).toEqual(null);
      });

      it('should instantiate privacyDateTimeConsent', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.privacyDateTimeConsent).toEqual(null);
      });

      it('should instantiate identityAuthentication', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.identityAuthentication).toEqual(mockCaseFileData.identityAuthentication);
      });

      it('should default identityAuthentication', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.identityAuthentication).toEqual({
          identificationIds: [],
          method: IdentityAuthenticationMethod.NotApplicable,
          status: IdentityAuthenticationStatus.NotVerified,
        });
      });

      it('should instantiate impactStatusValidation', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);
        expect(caseFile.impactStatusValidation).toEqual(mockCaseFileData.impactStatusValidation);
      });

      it('should default impactStatusValidation', () => {
        const caseFile = new CaseFileEntity();
        expect(caseFile.impactStatusValidation).toEqual({
          method: ImpactValidationMethod.NotApplicable, status: ValidationOfImpactStatus.Undetermined,
        });
      });
    });
  });
  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const caseFile = new CaseFileEntity(mockCaseFileData);

      expect(caseFile.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('household id is required', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);

        caseFile.householdId = null;

        expect(caseFile.validate()).toContain('The household id is required');
      });

      test('caseFile Number is required', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);

        caseFile.caseFileNumber = null;

        expect(caseFile.validate()).toContain('The case file number is required');
      });

      test('case File status is required', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);

        caseFile.caseFileStatus = null;

        expect(caseFile.validate()).toContain('The case file status is required');
      });

      test('case File event id is required', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);

        caseFile.eventId = null;

        expect(caseFile.validate()).toContain('The event id is required');
      });

      test('triage level is required', () => {
        const caseFile = new CaseFileEntity(mockCaseFileData);

        caseFile.triage = null;

        expect(caseFile.validate()).toContain('The triage level is required');
      });
    });
  });
});
