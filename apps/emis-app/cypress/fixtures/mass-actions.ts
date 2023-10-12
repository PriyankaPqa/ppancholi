import { generateXlsxFile, formatDate, generateCSVContent, IXlsxTableColumnProperties } from '@libs/cypress-lib/helpers';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { faker } from '@faker-js/faker';
import { IBaseMassActionFields } from '../pages/mass-action/base/baseCreateMassAction';
import { INewMassFinancialAssistanceFields } from '../pages/mass-action/mass-financial-assistance/newMassFinancialAssistance.page';

export const fixtureBaseMassAction = (retries: number) : IBaseMassActionFields => ({
  description: `description mass action - retry ${retries}`,
});

export const fixtureNewMassFinancialAssistance = () : INewMassFinancialAssistanceFields => ({
  paymentModality: 'Direct Deposit',
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentAmount: '80.00',
});

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
  PayeeType:string,
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

// properties also act as first row of financial assistance custom file
export const generateRandomFaCustomFileUserData = (caseFile:ICaseFileEntity, FinancialAssistanceTableId: string): IFinancialAssistanceCustomOptionsTemplate => ({
  CaseFileNumber: caseFile.caseFileNumber,
  CaseFileId: caseFile.id,
  Description: 'Description Payment',
  RevisedCreateDate: formatDate(`${faker.date.soon()}`),
  FinancialAssistanceTableId,
  PaymentModality: 'Cheque',
  Item: 'Clothing',
  SubItem: 'Winter Clothing',
  Amount: 80,
  RelatedNumber: null,
  PayeeType: 'Beneficiary',
  PayeeName: faker.name.fullName(),
  CareOf: faker.name.fullName(),
  Country: 'CA',
  StreetAddress: faker.address.streetAddress(),
  UnitSuite: faker.datatype.number(1000),
  City: faker.address.cityName(),
  Province: 'Ontario',
  SpecifiedOtherProvince: null,
  PostalCode: faker.helpers.replaceSymbols('?#?#?#'),
});

export const writeCSVContentToFile = <T>(filePath: string, data: T[]): string => {
  cy.writeFile(filePath, generateCSVContent(data));
  return generateCSVContent(data);
};

export const fixtureGenerateFaCsvFile = (caseFiles: ICaseFileEntity[], FinancialAssistanceTableId:string, filePath: string) => {
  const faData: IFinancialAssistanceCustomOptionsTemplate[] = [];
  for (const caseFile of caseFiles) {
    faData.push(generateRandomFaCustomFileUserData(caseFile, FinancialAssistanceTableId));
  }
  return writeCSVContentToFile(filePath, faData);
};

function extractXlsxRowFromUserData(caseFile: ICaseFileEntity, FinancialAssistanceTableId: string): string[] {
  return Object.values(generateRandomFaCustomFileUserData(caseFile, FinancialAssistanceTableId));
}

function generateXlsxRowsData(caseFiles: ICaseFileEntity[], FinancialAssistanceTableId: string): string[][] {
  const allRowsData: string[][] = [];
  caseFiles.forEach((caseFile) => {
    const individualRowData = extractXlsxRowFromUserData(caseFile, FinancialAssistanceTableId);
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractXlsxColumnNamesFromUserData(caseFile: ICaseFileEntity, FinancialAssistanceTableId: string): IXlsxTableColumnProperties[] {
  const userData = generateRandomFaCustomFileUserData(caseFile, FinancialAssistanceTableId);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateFaCustomOptionsXlsxFile = (caseFiles: ICaseFileEntity[], FinancialAssistanceTableId:string, tableName: string, fileName: string) => {
  const columns = extractXlsxColumnNamesFromUserData(caseFiles[0], FinancialAssistanceTableId);
  const rows = generateXlsxRowsData(caseFiles, FinancialAssistanceTableId);
  return generateXlsxFile(columns, rows, tableName, fileName);
};
