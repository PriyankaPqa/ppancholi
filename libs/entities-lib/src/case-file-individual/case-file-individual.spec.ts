import {
  mockCaseFileIndividualEntity, CaseFileIndividualEntity,
} from './index';

const mockData = mockCaseFileIndividualEntity();

describe('>>> Case File', () => {
  describe('>> constructor', () => {
    describe('instantiate when data is passed', () => {
      it('should instantiate caseFileId', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate caseFileId', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.caseFileId).toEqual(mockData.caseFileId);
      });

      it('should instantiate personId', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.personId).toEqual(mockData.personId);
      });

      it('should instantiate membershipStatus', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.membershipStatus).toEqual(mockData.membershipStatus);
      });

      it('should instantiate receivingAssistanceDetails', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.receivingAssistanceDetails).toEqual(mockData.receivingAssistanceDetails);
      });

      it('should instantiate currentAddress', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.currentAddress).toEqual(mockData.currentAddress);
      });

      it('should instantiate temporaryAddressHistory', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.temporaryAddressHistory).toEqual(mockData.temporaryAddressHistory);
      });

      it('should instantiate receivingAssistance', () => {
        const item = new CaseFileIndividualEntity(mockData);
        expect(item.receivingAssistance).toEqual(mockData.receivingAssistance);
      });
    });
  });
});
