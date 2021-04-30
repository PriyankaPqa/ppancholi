import { CaseFile } from './case-file';
import { mockCaseFilesSearchData } from './case-file.mock';
import { } from './case-file.types';

const mockCaseFileData = mockCaseFilesSearchData()[0];

describe('>>> Case File', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.id).toBe('mock-id-1');
    });

    it('should instantiate beneficiary', () => {
      const caseFile = new CaseFile(mockCaseFileData);

      expect(caseFile.beneficiary).toEqual({
        id: 'mock-beneficiary-id-1',
        firstName: 'Jane',
        lastName: 'Doe',
        contactInformation: {
          email: 'Jane.doe@email.com',
          mobilePhoneNumber: {
            number: '(514) 123 4444',
            extension: '',
          },
          homePhoneNumber: null,
          alternatePhoneNumber: null,
        },
        homeAddress: {
          country: 'CA',
          streetAddress: 'Left str',
          unitSuite: '111',
          provinceCode: {
            translation: {
              en: 'QC',
              fr: 'QC',
            },
          },
          city: 'Montreal',
          postalCode: 'M4B 1G5',
        },
        householdMemberCount: 2,
      });
    });

    it('should instantiate caseFileNumber', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.caseFileNumber).toEqual('1-000001');
    });

    it('should instantiate caseFileStatusName', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.caseFileStatusName).toEqual({
        translation: {
          en: 'Archived',
          fr: 'Archive',
        },
      });
    });

    it('should instantiate caseFileStatus', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.caseFileStatus).toEqual(4);
    });

    it('should instantiate created', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.created).toEqual(new Date('2021-01-20T15:12:03.4219037Z'));
    });

    it('should instantiate isDuplicate', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.isDuplicate).toEqual(false);
    });

    it('should instantiate event', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.event).toEqual({
        id: 'e70da37e-67cd-4afb-9c36-530c7d8b191f',
        name: {
          translation: {
            en: 'Event 1 EN',
            fr: 'Event 1 FR',
          },
        },
      });
    });

    it('should instantiate tags', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.tags).toEqual([{
        id: 'mock-tag-id-1',
        name: {
          translation: {
            en: 'Do not communicate',
            fr: 'Ne pas contacter',
          },
        },
      }]);
    });

    it('should instantiate triage', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.triage).toEqual(1);
    });

    it('should instantiate triageName', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.triageName).toEqual({
        translation: {
          en: 'Level 1',
          fr: 'Sans objet',
        },
      });
    });

    it('should instantiate tenantId', () => {
      const caseFile = new CaseFile(mockCaseFileData);
      expect(caseFile.tenantId).toEqual('mock-tenant-id-1');
    });
  });

  describe('>> validation', () => {
    test('true is returned for a valid entity', () => {
      const caseFile = new CaseFile(mockCaseFileData);

      expect(caseFile.validate()).toBe(true);
    });

    describe('> validation attributes', () => {
      test('beneficiary id is required', () => {
        const caseFile = new CaseFile(mockCaseFileData);

        caseFile.beneficiary.id = null;

        expect(caseFile.validate()).toContain('The beneficiary id is required');
      });

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
