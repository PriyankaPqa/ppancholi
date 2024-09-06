import { useTaskStore } from '@/pinia/task/task';
import { IFinancialAssistanceTableEntity } from '@libs/entities-lib/financial-assistance';
import { IProgramEntity } from '@libs/entities-lib/program';

export interface IPaymentDetails { program: IProgramEntity, table: IFinancialAssistanceTableEntity, name: string }

export enum LodgingMode {
  BookingMode,
  MoveCrcProvidedAllowed,
  MoveCrcProvidedNotAllowed,
  ExtendStay,
  EditCrcProvidedAsNonLodging,
  EditCrcProvidedAsLodging,
  EditNotCrcProvided,
}

export default {
  isEditMode(mode: LodgingMode): boolean {
    return [LodgingMode.EditCrcProvidedAsLodging, LodgingMode.EditCrcProvidedAsNonLodging, LodgingMode.EditNotCrcProvided, LodgingMode.ExtendStay].indexOf(mode) > -1;
  },

  modeMayTriggerPayment(mode: LodgingMode): boolean {
    return [LodgingMode.BookingMode, LodgingMode.MoveCrcProvidedAllowed, LodgingMode.ExtendStay].indexOf(mode) > -1;
  },

  async checkLodgingTaskExists(vue: Vue): Promise<boolean> {
    if (!(await useTaskStore().fetchTaskCategories()).find((c) => c.isLodging)) {
      await vue.$message({
        title: vue.$t('impactedIndividuals.noLodgingTask.title'),
        message: vue.$t('impactedIndividuals.noLodgingTask.message'),
      });
      return false;
    }
    return true;
  },
};
