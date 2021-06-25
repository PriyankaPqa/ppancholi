import { FinancialAssistanceTable } from './financial-assistance';
import { mockFinancialAssistanceTableData } from './financial-assistance.mock';

const mockFinancialAssistanceTable = mockFinancialAssistanceTableData();

describe('>>> Financial assistance', () => {
  describe('>> constructor', () => {
    it('should instantiate id', () => {
      const financialAssistance = new FinancialAssistanceTable(mockFinancialAssistanceTable);
      expect(financialAssistance.id).toBe(mockFinancialAssistanceTable.id);
    });

    it('should instantiate name', () => {
      const financialAssistance = new FinancialAssistanceTable(mockFinancialAssistanceTable);
      expect(financialAssistance.name).toBe(mockFinancialAssistanceTable.name);
    });

    it('should instantiate eventId', () => {
      const financialAssistance = new FinancialAssistanceTable(mockFinancialAssistanceTable);
      expect(financialAssistance.eventId).toBe(mockFinancialAssistanceTable.eventId);
    });

    it('should instantiate status', () => {
      const financialAssistance = new FinancialAssistanceTable(mockFinancialAssistanceTable);
      expect(financialAssistance.status).toBe(mockFinancialAssistanceTable.status);
    });

    it('should instantiate programId', () => {
      const financialAssistance = new FinancialAssistanceTable(mockFinancialAssistanceTable);
      expect(financialAssistance.programId).toBe(mockFinancialAssistanceTable.programId);
    });

    it('should instantiate rows', () => {
      const financialAssistance = new FinancialAssistanceTable(mockFinancialAssistanceTable);
      expect(financialAssistance.rows).toBe(mockFinancialAssistanceTable.rows);
    });
  });
});
