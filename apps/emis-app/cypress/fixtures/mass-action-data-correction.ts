import { IXlsxTableColumnProperties, generateXlsxFile, removeSpecialCharacters, generateName } from '@libs/cypress-lib/helpers';
import { faker } from '@faker-js/faker';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { PaymentLineStatus } from '@libs/entities-lib/financial-assistance-payment';
import { IFinancialAssistanceMassActionTemplate } from './mass-actions';

export interface GenerateRandomFaDataCorrectionParams {
  caseFile: ICaseFileEntity;
  FinancialAssistancePaymentId: string;
  FinancialAssistanceTableId: string;
  FinancialAssistancePaymentGroupId: string;
  FinancialAssistancePaymentLinesId: string;
  ETag: string;
  PaymentLineStatus?: PaymentLineStatus;
  PaymentLineCancellationReason?: string;
}

export const generateRandomFaDataCorrectionData = (faCorrectionData?: GenerateRandomFaDataCorrectionParams): IFinancialAssistanceMassActionTemplate => ({
  CaseFileNumber: faCorrectionData.caseFile.caseFileNumber,
  FinancialAssistancePaymentId: faCorrectionData.FinancialAssistancePaymentId,
  Name: 'Test Mass Action',
  Description: 'Description Payment',
  FinancialAssistanceTableId: faCorrectionData.FinancialAssistanceTableId,
  RevisedCreateDate: null,
  FinancialAssistancePaymentGroupId: faCorrectionData.FinancialAssistancePaymentGroupId,
  PaymentModality: 'Cheque',
  PayeeType: 'Beneficiary',
  PayeeName: removeSpecialCharacters(generateName('fullName')),
  PaymentStatus: 'InProgress',
  CancellationReason: null,
  FinancialAssistancePaymentLinesId: faCorrectionData.FinancialAssistancePaymentLinesId,
  PaymentLineStatus: null,
  PaymentLineCancellationReason: null,
  Item: 'Clothing',
  SubItem: 'Winter Clothing',
  Amount: 100,
  ActualAmount: null,
  RelatedNumber: null,
  CareOf: removeSpecialCharacters(generateName('fullName')),
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
  PreferredLanguage: string,
  PrimarySpokenLanguage: string,
  PrimarySpokenLanguageSpecifiedOther: string,
  HomePhoneNumber: string,
  MobilePhoneNumber: string,
  AlternatePhoneNumber: string,
  AlternatePhoneNumberExtension: string,
  ETag: string
}

export const generateRandomContactInformationData = (personId:string, eTag: string): IContactInformationDataCorrectionTemplate => ({
  PersonId: personId,
  PreferredLanguage: 'English',
  PrimarySpokenLanguage: null,
  PrimarySpokenLanguageSpecifiedOther: null,
  HomePhoneNumber: faker.helpers.replaceSymbols('(514) 2##-####'),
  MobilePhoneNumber: null,
  AlternatePhoneNumber: null,
  AlternatePhoneNumberExtension: null,
  ETag: eTag,
});

export interface IAuthenticationDataCorrectionTemplate {
  CaseFileNumber: string,
  CaseFileId: string,
  Status: string,
  Method: string,
  ExceptionalType: string,
  ExceptionalTypeOther: string,
  IdProvided: string,
  IdProvidedOther: string
}

export const generateRandomAuthenticationOtherData = (caseFileId:string, caseFileNumber: string): IAuthenticationDataCorrectionTemplate => ({
  CaseFileNumber: caseFileNumber,
  CaseFileId: caseFileId,
  Status: 'Passed',
  Method: 'Exceptional',
  ExceptionalType: 'Approved by Legal',
  ExceptionalTypeOther: null,
  IdProvided: 'Canadian Passport (Group A)',
  IdProvidedOther: null,
});

export interface IHomeAddressDataCorrectionTemplate {
  HouseholdId:string,
  StreetAddress: string,
  UnitSuite: number,
  City: string,
  ProvinceEn: string,
  PostalCode: string,
  SpecifiedOtherProvince: string,
  Country: string,
  ETag: string
}

export const generateRandomHomeAddressData = (householdId:string, eTag: string): IHomeAddressDataCorrectionTemplate => ({
  HouseholdId: householdId,
  StreetAddress: faker.address.streetAddress(),
  UnitSuite: null,
  City: 'Toronto',
  ProvinceEn: 'Ontario',
  PostalCode: faker.helpers.replaceSymbols('?#?#?#'),
  SpecifiedOtherProvince: null,
  Country: 'CA',
  ETag: eTag,
});

export interface ILabelDataCorrectionTemplate {
  CaseFileId:string,
  LabelName1: string,
  LabelName2: string,
  LabelName3: string,
  LabelName4: string,
  ETag: string
}

export const generateRandomLabelData = (casefileId:string, eTag: string): ILabelDataCorrectionTemplate => ({
  CaseFileId: casefileId,
  LabelName1: 'Test Label 1',
  LabelName2: 'Test Label 2',
  LabelName3: 'Test Label 3',
  LabelName4: 'Test Label 4',
  ETag: eTag,
});

export interface ITriageDataCorrectionTemplate {
  CaseFileId: string,
  Triage: string,
}

export const generateRandomTriageData = (casefileId:string): ITriageDataCorrectionTemplate => ({
  CaseFileId: casefileId,
  Triage: 'Tier 2',
});

export interface IIdentitySetDataCorrectionTemplate {
  PersonId: string,
  FirstName: string,
  LastName: string,
  MiddleName: number,
  GenderSpecifiedOther: string,
  ETag: string
}

export const generateRandomIdentitySetData = (personId:string, eTag: string): IIdentitySetDataCorrectionTemplate => ({
  PersonId: personId,
  FirstName: removeSpecialCharacters(generateName('firstName')),
  LastName: removeSpecialCharacters(generateName('lastName')),
  MiddleName: null,
  GenderSpecifiedOther: 'after mass action data correction',
  ETag: eTag,
});

export interface ITemporaryAddressDataCorrectionTemplate {
  PersonId: string,
  AddressType: string,
  ShelterLocationId: string,
  PlaceName: string,
  StreetAddress: string,
  PlaceNumber: string,
  UnitSuite: number,
  City: string,
  PostalCode: string,
  ProvinceEn: string,
  SpecifiedOtherProvince: string,
  CrcProvided: string,
  CheckIn: string,
  CheckOut: string,
  ETag: string
}

export const generateRandomTemporaryAddressSetData = (personId:string, eTag: string): ITemporaryAddressDataCorrectionTemplate => ({
  PersonId: personId,
  AddressType: 'Unknown',
  ShelterLocationId: null,
  PlaceName: null,
  StreetAddress: null,
  PlaceNumber: null,
  UnitSuite: null,
  City: null,
  PostalCode: null,
  ProvinceEn: null,
  SpecifiedOtherProvince: null,
  CrcProvided: null,
  CheckIn: null,
  CheckOut: null,
  ETag: eTag,
});

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

export interface GenerateFaDataCorrectionXlsxFileParams {
  faCorrectionData: GenerateRandomFaDataCorrectionParams,
  caseFiles: ICaseFileEntity[],
  tableName: string,
  fileName: string
}

export const fixtureGenerateFaDataCorrectionXlsxFile = (params: GenerateFaDataCorrectionXlsxFileParams) => {
  const columns = extractXlsxColumnNamesFromFaDataCorrection(params.faCorrectionData);
  const rows = generateXlsxFaDataCorrectionRowsData(params.faCorrectionData, params.caseFiles);
  return generateXlsxFile(columns, rows, params.tableName, params.fileName);
};

function extractXlsxRowFromAuthenticationDataCorrectionData(caseFileId: string, caseFileNumber: string): string[] {
  return Object.values(generateRandomAuthenticationOtherData(caseFileId, caseFileNumber));
}

function generateXlsxAuthenticationDataCorrectionRowsData(caseFiles: ICaseFileEntity[]): string[][] {
  const allRowsData: string[][] = [];
  caseFiles.forEach((caseFile) => {
    const individualRowData = extractXlsxRowFromAuthenticationDataCorrectionData(caseFile.id, caseFile.caseFileNumber);
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractXlsxColumnNamesFromAuthenticationDataCorrection(caseFileId: string, caseFileNumber: string): IXlsxTableColumnProperties[] {
  const userData = generateRandomAuthenticationOtherData(caseFileId, caseFileNumber);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateAuthenticationDataCorrectionXlsxFile = (caseFiles: ICaseFileEntity[], tableName: string, fileName: string) => {
  const columns = extractXlsxColumnNamesFromAuthenticationDataCorrection(caseFiles[0].id, caseFiles[0].caseFileNumber);
  const rows = generateXlsxAuthenticationDataCorrectionRowsData(caseFiles);
  return generateXlsxFile(columns, rows, tableName, fileName);
};

function generateXlsxContactInformationDataCorrectionRowsData(primaryMemberHouseholds: Record<string, string>): string[][] {
  const allRowsData: string[][] = [];
  Object.entries(primaryMemberHouseholds).forEach(([personId, eTag]) => {
    const individualRowData = Object.values(generateRandomContactInformationData(personId, eTag));
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractXlsxColumnNamesFromContactInformationDataCorrection(primaryMemberHouseholds: Record<string, string>): IXlsxTableColumnProperties[] {
  const firstPersonId = Object.keys(primaryMemberHouseholds)[0];
  const firstETag = primaryMemberHouseholds[firstPersonId];
  const userData = generateRandomContactInformationData(firstPersonId, firstETag);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateContactInformationDataCorrectionXlsxFile = (primaryMemberHouseholds: Record<string, string>, tableName: string, fileName: string) => {
  const columns = extractXlsxColumnNamesFromContactInformationDataCorrection(primaryMemberHouseholds);
  const rows = generateXlsxContactInformationDataCorrectionRowsData(primaryMemberHouseholds);
  return generateXlsxFile(columns, rows, tableName, fileName);
};

function generateXlsxHomeAddressDataCorrectionRowsData(primaryMemberHouseholds: Record<string, string>): string[][] {
  const allRowsData: string[][] = [];
  Object.entries(primaryMemberHouseholds).forEach(([personId, eTag]) => {
    const individualRowData = Object.values(generateRandomHomeAddressData(personId, eTag));
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractXlsxColumnNamesFromHomeAddressDataCorrection(primaryMemberHouseholds: Record<string, string>): IXlsxTableColumnProperties[] {
  const firstHouseholdId = Object.keys(primaryMemberHouseholds)[0];
  const firstETag = primaryMemberHouseholds[firstHouseholdId];
  const userData = generateRandomHomeAddressData(firstHouseholdId, firstETag);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateHomeAddressDataCorrectionXlsxFile = (primaryMemberHouseholds: Record<string, string>, tableName: string, fileName: string) => {
  const columns = extractXlsxColumnNamesFromHomeAddressDataCorrection(primaryMemberHouseholds);
  const rows = generateXlsxHomeAddressDataCorrectionRowsData(primaryMemberHouseholds);
  return generateXlsxFile(columns, rows, tableName, fileName);
};

function generateXlsxIdentitySetDataCorrectionRowsData(memberHouseholds: Record<string, string>): string[][] {
  const allRowsData: string[][] = [];
  Object.entries(memberHouseholds).forEach(([personId, eTag]) => {
    const individualRowData = Object.values(generateRandomIdentitySetData(personId, eTag));
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractXlsxColumnNamesFromIdentitySetDataCorrection(memberHouseholds: Record<string, string>): IXlsxTableColumnProperties[] {
  const firstMemberHouseholdId = Object.keys(memberHouseholds)[0];
  const firstETag = memberHouseholds[firstMemberHouseholdId];
  const userData = generateRandomIdentitySetData(firstMemberHouseholdId, firstETag);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateIdentitySetDataCorrectionXlsxFile = (memberHouseholds: Record<string, string>, tableName: string, fileName: string) => {
  const columns = extractXlsxColumnNamesFromIdentitySetDataCorrection(memberHouseholds);
  const rows = generateXlsxIdentitySetDataCorrectionRowsData(memberHouseholds);
  return generateXlsxFile(columns, rows, tableName, fileName);
};

function generateLabelDataCorrectionRowsData(casefiles: Record<string, string>): string[][] {
  const allRowsData: string[][] = [];
  Object.entries(casefiles).forEach(([caseFileId, eTag]) => {
    const individualRowData = Object.values(generateRandomLabelData(caseFileId, eTag));
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractLabelDataCorrectionColumnNames(casefiles: Record<string, string>): IXlsxTableColumnProperties[] {
  const firstCaseFileId = Object.keys(casefiles)[0];
  const firstETag = casefiles[firstCaseFileId];
  const userData = generateRandomLabelData(firstCaseFileId, firstETag);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateLabelDataCorrectionXlsxFile = (casefiles: Record<string, string>, tableName: string, fileName: string) => {
  const columns = extractLabelDataCorrectionColumnNames(casefiles);
  const rows = generateLabelDataCorrectionRowsData(casefiles);
  return generateXlsxFile(columns, rows, tableName, fileName);
};

function generateTemporaryAddressDataCorrectionRowsData(memberHouseholds: Record<string, string>): string[][] {
  const allRowsData: string[][] = [];
  Object.entries(memberHouseholds).forEach(([personId, eTag]) => {
    const individualRowData = Object.values(generateRandomTemporaryAddressSetData(personId, eTag));
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

function extractTemporaryAddressDataCorrectionColumnNames(memberHouseholds: Record<string, string>): IXlsxTableColumnProperties[] {
  const firstPersonId = Object.keys(memberHouseholds)[0];
  const firstETag = memberHouseholds[firstPersonId];
  const userData = generateRandomTemporaryAddressSetData(firstPersonId, firstETag);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

export const fixtureGenerateTemporaryAddressDataCorrectionXlsxFile = (memberHouseholds: Record<string, string>, tableName: string, fileName: string) => {
  const columns = extractTemporaryAddressDataCorrectionColumnNames(memberHouseholds);
  const rows = generateTemporaryAddressDataCorrectionRowsData(memberHouseholds);
  return generateXlsxFile(columns, rows, tableName, fileName);
};

function extractTriageDataCorrectionColumnNames(casefiles: Record<string, string>): IXlsxTableColumnProperties[] {
  const firstCaseFileId = Object.keys(casefiles)[0];
  const userData = generateRandomTriageData(firstCaseFileId);
  const columnNames = Object.keys(userData).map((columnName) => ({
    name: columnName,
    filterButton: true,
  }));
  return columnNames;
}

function generateTriageDataCorrectionRowsData(casefiles: Record<string, string>): string[][] {
  const allRowsData: string[][] = [];
  Object.entries(casefiles).forEach(([caseFileId]) => {
    const individualRowData = Object.values(generateRandomTriageData(caseFileId));
    allRowsData.push(individualRowData);
  });
  return allRowsData;
}

export const fixtureGenerateTriageDataCorrectionXlsxFile = (casefiles: Record<string, string>, tableName: string, fileName: string) => {
  const columns = extractTriageDataCorrectionColumnNames(casefiles);
  const rows = generateTriageDataCorrectionRowsData(casefiles);
  return generateXlsxFile(columns, rows, tableName, fileName);
};
