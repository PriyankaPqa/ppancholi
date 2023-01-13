import { IBirthDate } from '@libs/entities-lib/value-objects/identity-set';
import { IPhoneNumber } from '@libs/entities-lib/value-objects/contact-information';

export interface IInformationFromBeneficiarySearch {
  birthDate: IBirthDate;
  emailAddress: string;
  firstName: string;
  lastName: string;
  phone: IPhoneNumber;
  registrationNumber: string;
}
