import { mockProgramsSearchData, Program } from '@/entities/program';
import { mockHttp } from '../httpClient.mock';
import { ProgramsService } from './programs';

const http = mockHttp();

describe('>>> Programs service', () => {
  const service = new ProgramsService(http as never);
  const mockProgram = mockProgramsSearchData()[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProgram', () => {
    it('is linked to the correct url', async () => {
      await service.createProgram(new Program(mockProgram));
      expect(http.post).toHaveBeenCalledWith('/event/programs', expect.anything(), { globalHandler: false });
    });

    it('converts program entity to the correct payload', async () => {
      await service.createProgram(new Program(mockProgram));
      expect(http.post).toHaveBeenCalledWith('/event/programs', {
        name: mockProgram.programName,
        description: mockProgram.programDescription,
        eventId: mockProgram.eventId,
        paymentModalities: mockProgram.paymentModalities,
        eligibilityCriteria: mockProgram.eligibilityCriteria,
        approvalRequired: mockProgram.approvalRequired,
        programStatus: mockProgram.programStatus,
      }, expect.anything());
    });
  });

  describe('updateProgram', () => {
    it('is linked to the correct url', async () => {
      await service.updateProgram(new Program(mockProgram));
      expect(http.patch).toHaveBeenCalledWith(`/event/programs/${mockProgram.programId}/edit`, expect.anything(), { globalHandler: false });
    });

    it('converts program entity to the correct payload', async () => {
      await service.updateProgram(new Program(mockProgram));
      expect(http.patch).toHaveBeenCalledWith(`/event/programs/${mockProgram.programId}/edit`, {
        name: mockProgram.programName,
        description: mockProgram.programDescription,
        paymentModalities: mockProgram.paymentModalities,
        eligibilityCriteria: mockProgram.eligibilityCriteria,
        approvalRequired: mockProgram.approvalRequired,
        programStatus: mockProgram.programStatus,
      }, expect.anything());
    });
  });

  describe('searchPrograms', () => {
    it('is linked to the correct url', async () => {
      await service.searchPrograms({});
      expect(http.get).toHaveBeenCalledWith('/search/program-projections', {
        isOData: true,
        params: {},
      });
    });
  });
});
