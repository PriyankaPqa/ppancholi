import { Program } from './program';
import { mockProgramsSearchData } from './program.mock';
import { EPaymentModalities, EProgramStatus, IProgram } from './program.types';

const mockProgramData = mockProgramsSearchData()[0];

describe('>>> Program', () => {
  describe('>> constructor', () => {
    let program: IProgram;

    beforeEach(() => {
      program = new Program(mockProgramData);
    });

    it('should instantiate id', () => {
      expect(program.id).toBe('50448672-17db-4640-9cdf-83a310821245');
    });

    it('should instantiate created', () => {
      expect(program.created).toBe('2021-03-31T15:23:00.755Z');
    });

    it('should instantiate name', () => {
      expect(program.name).toEqual({
        translation: {
          en: 'Program A',
          fr: 'Program A FR',
        },
      });
    });

    it('should instantiate description', () => {
      expect(program.description).toEqual({
        translation: {
          en: 'Description EN',
          fr: 'Description FR',
        },
      });
    });

    it('should instantiate approvalRequired', () => {
      expect(program.approvalRequired).toBe(true);
    });

    it('should instantiate eligibilityCriteria', () => {
      expect(program.eligibilityCriteria).toEqual({
        authenticated: true,
        completedAssessments: false,
        impacted: false,
      });
    });

    it('should instantiate eventId', () => {
      expect(program.eventId).toBe('d3becde1-6ec7-4b59-85c0-6e7fa3511e2e');
    });

    it('should instantiate programStatus', () => {
      expect(program.programStatus).toBe(EProgramStatus.Active);
    });

    it('should instantiate paymentModalities', () => {
      expect(program.paymentModalities).toEqual([
        EPaymentModalities.Cheque,
        EPaymentModalities.DirectDeposit,
        EPaymentModalities.GiftCard,
        EPaymentModalities.Invoice,
        EPaymentModalities.PrepaidCard,
        EPaymentModalities.Voucher,
      ]);
    });
  });
});
