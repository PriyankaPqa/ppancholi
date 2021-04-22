import { IProgramData, IProgramSearchData } from '@/entities/program';
import utils from '@/entities/utils';

export const mapProgramDataToSearchData = (
  programData: IProgramData,
): IProgramSearchData => ({
  programId: programData.id,
  eventId: programData.eventId,
  approvalRequired: programData.approvalRequired,
  createdDate: programData.created,
  programName: utils.initMultilingualAttributes(programData.name),
  programDescription: utils.initMultilingualAttributes(programData.description),
  paymentModalities: [...programData.paymentModalities],
  programStatus: programData.programStatus,
  programStatusName: null,
  eligibilityCriteria: {
    ...programData.eligibilityCriteria,
  },
});
