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

export function isEditMode(mode: LodgingMode): boolean {
  return [LodgingMode.EditCrcProvidedAsLodging, LodgingMode.EditCrcProvidedAsNonLodging, LodgingMode.EditNotCrcProvided, LodgingMode.ExtendStay].indexOf(mode) > -1;
}

export function modeMayTriggerPayment(mode: LodgingMode): boolean {
  return [LodgingMode.BookingMode, LodgingMode.MoveCrcProvidedAllowed, LodgingMode.ExtendStay].indexOf(mode) > -1;
}
