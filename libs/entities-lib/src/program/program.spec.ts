import { mockProgramEntityData } from './index';
import { ProgramEntity } from './program';
import { IProgramEntity } from './program.types';

const mockProgramData = mockProgramEntityData();

describe('>>> Program', () => {
  describe('>> constructor', () => {
    let program: IProgramEntity;

    beforeEach(() => {
      program = new ProgramEntity(mockProgramData);
    });

    it('should instantiate id', () => {
      expect(program.id).toBe(mockProgramData.id);
    });

    it('should instantiate created', () => {
      expect(program.created).toBe(mockProgramData.created);
    });

    it('should instantiate name', () => {
      expect(program.name).toEqual(mockProgramData.name);
    });

    it('should instantiate description', () => {
      expect(program.description).toEqual(mockProgramData.description);
    });

    it('should instantiate approvalRequired', () => {
      expect(program.approvalRequired).toBe(true);
    });

    it('should instantiate useForLodging', () => {
      expect(program.useForLodging).toBe(true);
    });

    it('should instantiate eligibilityCriteria', () => {
      expect(program.eligibilityCriteria).toEqual(mockProgramData.eligibilityCriteria);
    });

    it('should instantiate eventId', () => {
      expect(program.eventId).toBe(mockProgramData.eventId);
    });

    it('should instantiate programStatus', () => {
      expect(program.status).toBe(mockProgramData.status);
    });

    it('should instantiate paymentModalities', () => {
      expect(program.paymentModalities).toEqual(mockProgramData.paymentModalities);
    });
  });
});
