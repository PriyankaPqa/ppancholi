import { BaseEntity } from '../base';
import { ICaseFileIndividualEntity, ReceivingAssistanceDetail, TemporaryAddress } from './case-file-individual.types';

export class CaseFileIndividualEntity extends BaseEntity implements ICaseFileIndividualEntity {
  caseFileId: uuid;

  personId: uuid;

  receivingAssistanceDetails: ReceivingAssistanceDetail[];

  currentAddress: TemporaryAddress;

  temporaryAddressHistory: TemporaryAddress[];

  receivingAssistance: boolean;

  constructor(data?: ICaseFileIndividualEntity) {
    super(data);
    this.caseFileId = data?.caseFileId;
    this.personId = data?.personId;
    this.receivingAssistanceDetails = data?.receivingAssistanceDetails ? [...data.receivingAssistanceDetails] : [];
    this.currentAddress = data?.currentAddress;
    this.temporaryAddressHistory = data?.temporaryAddressHistory ? [...data.temporaryAddressHistory] : [];
    this.receivingAssistance = data?.receivingAssistance;
  }
}
