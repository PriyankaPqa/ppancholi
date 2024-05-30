import {
  generateXlsxFile,
  generateCSVContent,
  IXlsxTableColumnProperties,
  formatDate,
  getCurrentDateString,
  getRandomNumber,
  removeSpecialCharacters } from '@libs/cypress-lib/helpers';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { faker } from '@faker-js/faker';
import { IBaseMassActionFields } from '../pages/mass-action/base/baseCreateMassAction';
import { INewMassFinancialAssistanceFields } from '../pages/mass-action/mass-financial-assistance/newMassFinancialAssistance.page';
import { INewMassCaseFileStatusFields } from '../pages/mass-action/mass-case-file-status/newMassCaseFileStatus.page';

export interface GenerateFaCustomOptionsXlsxFileParams {
  caseFiles: ICaseFileEntity[],
  financialAssistanceTableId:string,
  tableName: string,
  fileName: string
}

export const fixtureBaseMassAction = (retries: number) : IBaseMassActionFields => ({
  name: `test mass action - ${getCurrentDateString()} - s${getRandomNumber()} - retry(${retries})`,
  description: `description mass action - retry ${retries}`,
});

export const fixtureNewMassFinancialAssistance = (force?: INewMassFinancialAssistanceFields) : INewMassFinancialAssistanceFields => ({
  paymentModality: 'Direct Deposit',
  item: 'Clothing',
  subItem: 'Winter Clothing',
  paymentAmount: '80.00',
  ...force,
});

export const fixtureNewCaseFileStatus = (force?: INewMassCaseFileStatusFields): INewMassCaseFileStatusFields => ({
  caseFileStatus: 'Open',
  reason: '',
  reasonSpecifyOther: '',
  rationale: 'mock-rationale-string',
  ...force,
});

export interface IFinancialAssistanceMassActionTemplate {
  CaseFileNumber?: string;
  CaseFileId?: string;
  Description?: string;
  RevisedCreateDate?: string;
  FinancialAssistanceTableId?: string;
  PaymentModality?: string;
  Item?: string;
  SubItem?: string;
  Amount?: number;
  RelatedNumber?: number;
  PayeeType?:string,
  PayeeName?: string;
  CareOf?: string;
  Country?: string;
  StreetAddress?: string;
  UnitSuite?: number;
  City?: string;
  Province?: string;
  SpecifiedOtherProvince?: string;
  PostalCode?: string
  FinancialAssistancePaymentId?: string;
  Name?: string;
  FinancialAssistancePaymentGroupId?: string;
  PaymentStatus?: string;
  CancellationReason?: string;
  FinancialAssistancePaymentLinesId?: string;
  ActualAmount?: number;
  ETag?: string;
  PaymentLineStatus?: string,
  PaymentLineCancellationReason?: string,
}

// properties also act as first row of financial assistance custom file
export const generateRandomFaCustomFileUserData = (caseFile:ICaseFileEntity, FinancialAssistanceTableId: string): IFinancialAssistanceMassActionTemplate => ({
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
  PayeeName: removeSpecialCharacters(faker.name.fullName()),
  CareOf: removeSpecialCharacters(faker.name.fullName()),
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
  const faData: IFinancialAssistanceMassActionTemplate[] = [];
  for (const caseFile of caseFiles) {
    faData.push(generateRandomFaCustomFileUserData(caseFile, FinancialAssistanceTableId));
  }
  return writeCSVContentToFile(filePath, faData);
};

export const fixtureGenerateCaseFileStatusCsvFile = (caseFiles: ICaseFileEntity[], filePath: string) => {
  const caseFileStatusData = [];
  for (const caseFile of caseFiles) {
    caseFileStatusData.push({
      CaseFileNumber: caseFile.caseFileNumber,
      CaseFileId: caseFile.id,
    });
  }
  return writeCSVContentToFile(filePath, caseFileStatusData);
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

export const fixtureGenerateFaCustomOptionsXlsxFile = (params: GenerateFaCustomOptionsXlsxFileParams) => {
  const columns = extractXlsxColumnNamesFromUserData(params.caseFiles[0], params.financialAssistanceTableId);
  const rows = generateXlsxRowsData(params.caseFiles, params.financialAssistanceTableId);
  return generateXlsxFile(columns, rows, params.tableName, params.fileName);
};
