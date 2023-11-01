import { generateXlsxFile, formatDate, generateCSVContent, IXlsxTableColumnProperties, getCurrentDateString, getRandomNumber } from '@libs/cypress-lib/helpers';
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

export interface GenerateRandomFaDataCorrectionParams {
  caseFile: ICaseFileEntity;
  FinancialAssistancePaymentId: string;
  FinancialAssistanceTableId: string;
  FinancialAssistancePaymentGroupId: string;
  FinancialAssistancePaymentLinesId: string;
  ETag: string;
}

export const generateRandomFaDataCorrectionData = (faCorrectionData: GenerateRandomFaDataCorrectionParams): IFinancialAssistanceMassActionTemplate => ({
  CaseFileNumber: faCorrectionData.caseFile.caseFileNumber,
  FinancialAssistancePaymentId: faCorrectionData.FinancialAssistancePaymentId,
  Name: 'Test Mass Action',
  Description: 'Description Payment',
  FinancialAssistanceTableId: faCorrectionData.FinancialAssistanceTableId,
  RevisedCreateDate: null,
  FinancialAssistancePaymentGroupId: faCorrectionData.FinancialAssistancePaymentGroupId,
  PaymentModality: 'Cheque',
  PayeeType: 'Beneficiary',
  PayeeName: faker.name.fullName(),
  PaymentStatus: 'InProgress',
  CancellationReason: null,
  FinancialAssistancePaymentLinesId: faCorrectionData.FinancialAssistancePaymentLinesId,
  Item: 'Clothing',
  SubItem: 'Winter Clothing',
  Amount: 100,
  ActualAmount: null,
  RelatedNumber: null,
  CareOf: faker.name.fullName(),
  Country: 'CA',
  StreetAddress: faker.address.streetAddress(),
  UnitSuite: faker.datatype.number(1000),
  City: faker.address.cityName(),
  Province: 'Ontario',
  SpecifiedOtherProvince: null,
  PostalCode: faker.helpers.replaceSymbols('?#?#?#'),
  ETag: faCorrectionData.ETag,
});

export interface IContactInformationDataCorrectionTemplate {
  PersonId: string,
  PrimarySpokenLanguageSpecifiedOther: string,
  HomePhoneNumber: string,
  MobilePhoneNumber: string,
  AlternatePhoneNumber: string,
  AlternatePhoneNumberExtension: string,
  ETag: string
}

export const generateRandomContactInformationData = (personId:string, eTag: string): IContactInformationDataCorrectionTemplate => ({
  PersonId: personId,
  PrimarySpokenLanguageSpecifiedOther: faker.helpers.arrayElement(['English', 'French', 'Arabic', 'German', 'Punjabi']),
  HomePhoneNumber: faker.helpers.replaceSymbols('(514) 2##-####'),
  MobilePhoneNumber: null,
  AlternatePhoneNumber: null,
  AlternatePhoneNumberExtension: null,
  ETag: eTag,
});

export interface IAuthenticationOtherDataCorrectionTemplate {
  CaseFileId: string,
  AuthenticationSpecifiedOther: string,
  ETag: string
}

export const generateRandomAuthenticationOtherData = (caseFileId:string, eTag: string): IAuthenticationOtherDataCorrectionTemplate => ({
  CaseFileId: caseFileId,
  AuthenticationSpecifiedOther: 'Test Automation',
  ETag: eTag,
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

export const fixtureGenerateContactInformationDataCorrectionCsvFile = (primaryMemberHouseholds: Record<string, string>, filePath: string) => {
  const correctionData: IContactInformationDataCorrectionTemplate[] = [];

  for (const [id, eTag] of Object.entries(primaryMemberHouseholds)) {
    correctionData.push(generateRandomContactInformationData(id, eTag.replace(/"/g, '')));
  }
  return writeCSVContentToFile(filePath, correctionData);
};

export const fixtureGenerateAuthenticationOtherDataCorrectionCsvFile = (primaryMemberHouseholds: Record<string, string>, filePath: string) => {
  const correctionData: IAuthenticationOtherDataCorrectionTemplate[] = [];

  for (const [casefileId, eTag] of Object.entries(primaryMemberHouseholds)) {
    correctionData.push(generateRandomAuthenticationOtherData(casefileId, eTag.replace(/"/g, '')));
  }
  return writeCSVContentToFile(filePath, correctionData);
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

function extractXlsxRowFromFaDataCorrectionData(faCorrectionData: GenerateRandomFaDataCorrectionParams): string[] {
  return Object.values(generateRandomFaDataCorrectionData(faCorrectionData));
}

function generateXlsxFaDataCorrectionRowsData(faCorrectionData: GenerateRandomFaDataCorrectionParams, caseFiles: ICaseFileEntity[]): string[][] {
  const allRowsData: string[][] = [];
  caseFiles.forEach((caseFile) => {
    const individualRowData = extractXlsxRowFromFaDataCorrectionData({ ...faCorrectionData, caseFile });
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractXlsxColumnNamesFromFaDataCorrection(faCorrectionData: GenerateRandomFaDataCorrectionParams): IXlsxTableColumnProperties[] {
  const userData = generateRandomFaDataCorrectionData(faCorrectionData);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

// eslint-disable-next-line
export const fixtureGenerateFaDataCorrectionXlsxFile = (faCorrectionData: GenerateRandomFaDataCorrectionParams, caseFiles: ICaseFileEntity[], tableName: string, fileName: string) => {
  const columns = extractXlsxColumnNamesFromFaDataCorrection(faCorrectionData);
  const rows = generateXlsxFaDataCorrectionRowsData(faCorrectionData, caseFiles);
  return generateXlsxFile(columns, rows, tableName, fileName);
};
