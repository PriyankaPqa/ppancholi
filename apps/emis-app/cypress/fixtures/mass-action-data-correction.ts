import { IXlsxTableColumnProperties, generateXlsxFile } from '@libs/cypress-lib/helpers';
import { faker } from '@faker-js/faker';
import { ICaseFileEntity } from '@libs/entities-lib/case-file';
import { IFinancialAssistanceMassActionTemplate, writeCSVContentToFile } from './mass-actions';

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

export const generateLabelData = (casefileId:string, eTag: string): ILabelDataCorrectionTemplate => ({
  CaseFileId: casefileId,
  LabelName1: 'Test Label 1',
  LabelName2: 'Test Label 2',
  LabelName3: 'Test Label 3',
  LabelName4: 'Test Label 4',
  ETag: eTag,
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
  FirstName: faker.name.firstName(),
  LastName: faker.name.lastName(),
  MiddleName: null,
  GenderSpecifiedOther: null,
  ETag: eTag,
});

export interface ITemporaryAddressDataCorrectionTemplate {
  PersonId: string,
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
  PlaceName: null,
  StreetAddress: faker.address.streetAddress(),
  PlaceNumber: null,
  UnitSuite: null,
  City: 'Brampton',
  PostalCode: faker.helpers.replaceSymbols('?#?#?#'),
  ProvinceEn: 'Ontario',
  SpecifiedOtherProvince: null,
  CrcProvided: null,
  CheckIn: null,
  CheckOut: null,
  ETag: eTag,
});

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

export const fixtureGenerateHomeAddressDataCorrectionCsvFile = (households: Record<string, string>, filePath: string) => {
  const correctionData: IHomeAddressDataCorrectionTemplate[] = [];

  for (const [householdId, eTag] of Object.entries(households)) {
    correctionData.push(generateRandomHomeAddressData(householdId, eTag.replace(/"/g, '')));
  }
  return writeCSVContentToFile(filePath, correctionData);
};

export const fixtureGenerateLabelDataCorrectionCsvFile = (memberHouseholds: Record<string, string>, filePath: string) => {
  const correctionData: ILabelDataCorrectionTemplate[] = [];

  for (const [casefileId, eTag] of Object.entries(memberHouseholds)) {
    correctionData.push(generateLabelData(casefileId, eTag.replace(/"/g, '')));
  }
  return writeCSVContentToFile(filePath, correctionData);
};

export const fixtureGenerateIdentitySetDataCorrectionCsvFile = (primaryMemberHouseholds: Record<string, string>, filePath: string) => {
  const correctionData: IIdentitySetDataCorrectionTemplate[] = [];

  for (const [id, eTag] of Object.entries(primaryMemberHouseholds)) {
    correctionData.push(generateRandomIdentitySetData(id, eTag.replace(/"/g, '')));
  }
  return writeCSVContentToFile(filePath, correctionData);
};

export const fixtureGenerateTemporaryAddressDataCorrectionCsvFile = (primaryMemberHouseholds: Record<string, string>, filePath: string) => {
  const correctionData: ITemporaryAddressDataCorrectionTemplate[] = [];

  for (const [id, eTag] of Object.entries(primaryMemberHouseholds)) {
    correctionData.push(generateRandomTemporaryAddressSetData(id, eTag.replace(/"/g, '')));
  }
  return writeCSVContentToFile(filePath, correctionData);
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
