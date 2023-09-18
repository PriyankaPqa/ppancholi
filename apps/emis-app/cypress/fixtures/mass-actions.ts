import { formatDate, generateCSVContent, getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { faker } from '@faker-js/faker';
import { IBaseMassActionFields } from '../pages/mass-action/base/baseCreateMassAction';
import { INewMassFinancialAssistanceFields } from '../pages/mass-action/mass-financial-assistance/newMassFinancialAssistance.page';

export const fixtureBaseMassAction = (retries: number) : IBaseMassActionFields => ({
  name: `test mass action - ${getCurrentDateString()} - s${getRandomNumber()} - retry(${retries})`,
  description: `description mass action - retry ${retries}`,
});

export const fixtureNewMassFinancialAssistance = () : INewMassFinancialAssistanceFields => ({
  paymentModality: 'Direct Deposit',
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentAmount: '80.00',
});

export const writeCSVContentToFile = <T>(filePath: string, data: T[]): string => {
  cy.writeFile(filePath, generateCSVContent(data));
  return generateCSVContent(data);
};

// properties also act as first row of financial assistance custom file
export interface IFinancialAssistanceCustomOptionsTemplate {
  CaseFileNumber: string;
  CaseFileId: string;
  Description: string;
  RevisedCreateDate: string;
  FinancialAssistanceTableId: string;
  PaymentModality: string;
  Item: string;
  SubItem: string;
  Amount: number;
  RelatedNumber: number;
  PayeeName: string;
  CareOf: string;
  Country: string;
  StreetAddress: string;
  UnitSuite: number;
  City: string;
  Province: string;
  SpecifiedOtherProvince: string;
  PostalCode: string
}

export const generateRandomUserData = (caseFile:ICaseFileEntity, FinancialAssistanceTableId: string): IFinancialAssistanceCustomOptionsTemplate => ({
  CaseFileNumber: caseFile.caseFileNumber,
  CaseFileId: caseFile.id,
  Description: 'Description Payment',
  RevisedCreateDate: formatDate(`${faker.date.soon()}`),
  FinancialAssistanceTableId,
  PaymentModality: 'Direct Deposit',
  Item: 'Clothing',
  SubItem: 'Winter Clothing',
  Amount: 50,
  RelatedNumber: faker.datatype.number(1000),
  PayeeName: faker.name.fullName(),
  CareOf: faker.name.fullName(),
  Country: 'Canada',
  StreetAddress: faker.address.streetAddress(),
  UnitSuite: faker.datatype.number(1000),
  City: faker.address.cityName(),
  Province: 'Ontario',
  SpecifiedOtherProvince: 'Quebec',
  PostalCode: faker.helpers.replaceSymbols('?#?#?#'),
});

export const fixtureGenerateCustomFinancialAssistanceFile = (caseFiles: ICaseFileEntity[], FinancialAssistanceTableId:string, filePath: string) => {
  const faData: IFinancialAssistanceCustomOptionsTemplate[] = [];
  for (const caseFile of caseFiles) {
    faData.push(generateRandomUserData(caseFile, FinancialAssistanceTableId));
  }
  return writeCSVContentToFile(filePath, faData);
};
