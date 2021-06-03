import { CaseFile } from './case-file';
import { mockCaseFilesSearchData } from './case-file.mock';

const mockCaseFileData = mockCaseFilesSearchData()[0];

describe('>>> Case File', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.id).toBe(mockCaseFileData.caseFileId);
    });

    it('should instantiate assignedIndividualIds', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.assignedIndividualIds).toEqual(mockCaseFileData.assignedIndividualIds);
    });

    it('should instantiate assignedTeamIds', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.assignedTeamIds).toEqual(mockCaseFileData.assignedTeamIds);
    });

    it('should instantiate beneficiary', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.household).toEqual(mockCaseFileData.household);
    });

    it('should instantiate caseFileNumber', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.caseFileNumber).toEqual(mockCaseFileData.caseFileNumber);
    });

    it('should instantiate caseFileStatusName', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.caseFileStatusName).toEqual(mockCaseFileData.caseFileStatusName);
    });

    it('should instantiate caseFileStatus', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.caseFileStatus).toEqual(mockCaseFileData.caseFileStatus);
    });

    it('should instantiate created', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.created).toEqual(new Date(mockCaseFileData.caseFileCreatedDate));
    });

    it('should instantiate isDuplicate', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.isDuplicate).toEqual(mockCaseFileData.isDuplicate);
    });

    it('should instantiate event', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.event).toEqual(mockCaseFileData.event);
    });

    it('should instantiate tags', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.tags).toEqual(mockCaseFileData.tags);
    });

    it('should instantiate labels', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.labels).toEqual(mockCaseFileData.labels);
    });

    it('should instantiate timestamp', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.timestamp).toEqual(new Date(mockCaseFileData.timestamp));
    });

    it('should instantiate triage', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.triage).toEqual(mockCaseFileData.triage);
    });

    it('should instantiate triageName', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.triageName).toEqual(mockCaseFileData.triageName);
    });

    it('should instantiate tenantId', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.tenantId).toEqual(mockCaseFileData.tenantId);
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const caseFile = new CaseFile(mockCaseFileData);

      expect(caseFile.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      // test('beneficiary id is required', () => {
      //   const caseFile = new CaseFile(mockCaseFileData);

      //   caseFile.beneficiary.id = null;

      //   expect(caseFile.validate()).toContain('The beneficiary id is required');
      // });

      test('caseFile Number is required', () => {
        const caseFile = new CaseFile(mockCaseFileData);

        caseFile.caseFileNumber = null;

        expect(caseFile.validate()).toContain('The case file number is required');
      });

      test('caseFile Number is required', () => {
        const caseFile = new CaseFile(mockCaseFileData);

        caseFile.caseFileNumber = null;

        expect(caseFile.validate()).toContain('The case file number is required');
      });

      test('case File stats is required', () => {
        const caseFile = new CaseFile(mockCaseFileData);

        caseFile.caseFileStatus = null;

        expect(caseFile.validate()).toContain('The case file status is required');
      });

      test('case File event id is required', () => {
        const caseFile = new CaseFile(mockCaseFileData);

        caseFile.event.id = null;

        expect(caseFile.validate()).toContain('The event id is required');
      });
      test('triage level is required', () => {
        const caseFile = new CaseFile(mockCaseFileData);

        caseFile.triage = null;

        expect(caseFile.validate()).toContain('The triage level is required');
      });
    });
  });
});
