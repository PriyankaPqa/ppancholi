import { FinancialAssistanceTableEntity } from './financial-assistance';
import { mockFinancialAssistanceTableEntity } from './financial-assistance.mock';

const mockFinancialAssistanceTable = mockFinancialAssistanceTableEntity();

describe('>>> Financial assistance', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const financialAssistance = new FinancialAssistanceTableEntity(mockFinancialAssistanceTable);
      expect(financialAssistance.id).toBe(mockFinancialAssistanceTable.id);
    });

    it('should instantiate name', () => {
      const financialAssistance = new FinancialAssistanceTableEntity(mockFinancialAssistanceTable);
      expect(financialAssistance.name).toBe(mockFinancialAssistanceTable.name);
    });

    it('should instantiate eventId', () => {
      const financialAssistance = new FinancialAssistanceTableEntity(mockFinancialAssistanceTable);
      expect(financialAssistance.eventId).toBe(mockFinancialAssistanceTable.eventId);
    });

    it('should instantiate status', () => {
      const financialAssistance = new FinancialAssistanceTableEntity(mockFinancialAssistanceTable);
      expect(financialAssistance.status).toBe(mockFinancialAssistanceTable.status);
    });

    it('should instantiate programId', () => {
      const financialAssistance = new FinancialAssistanceTableEntity(mockFinancialAssistanceTable);
      expect(financialAssistance.programId).toBe(mockFinancialAssistanceTable.programId);
    });

    it('should instantiate items', () => {
      const financialAssistance = new FinancialAssistanceTableEntity(mockFinancialAssistanceTable);
      expect(financialAssistance.items).toBe(mockFinancialAssistanceTable.items);
    });
  });
});
