import { ReportingTopic } from '@libs/entities-lib/reporting';
import { Column } from 'devextreme/ui/data_grid_types';

export interface IDatasourceBase {
  columns: Column<any, any>[];
}

export interface IDatasourceSettings extends IDatasourceBase {
  url: string,
  reportingTopic: ReportingTopic;
  columns: Column<any, any>[]
  key: string[];
}

export const caseNoteViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: true },
    { dataField: 'subject', dataType: 'string' },
    { dataField: 'description', dataType: 'string' },
    { dataField: 'caseNoteCategoryNameEn', dataType: 'string', visible: false },
    { dataField: 'caseNoteCategoryNameFr', dataType: 'string', visible: false },
    // { dataField: 'caseNoteCategoryNameEnFr', dataType: 'string', visible: false },
    { dataField: 'userCreatedByName', dataType: 'string' },
    { dataField: 'userUpdatedByName', dataType: 'string', visible: false },
    { dataField: 'createDate', dataType: 'datetime' },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    /* case file view */
    { dataField: 'caseFile.caseFileNumber', dataType: 'string' },
    { dataField: 'caseFile.eventNameEn', dataType: 'string' },
    { dataField: 'caseFile.triageEn', dataType: 'string', visible: false },
    { dataField: 'caseFile.householdCount', dataType: 'number' },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.casenote.${x.dataField}` })),
};

export const caseFileActivitiesViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'activityTypeNameEn', dataType: 'string', visible: false },
    { dataField: 'activityTypeNameFr', dataType: 'string', visible: false },
    // { dataField: 'activityTypeNameEnFr', dataType: 'string', visible: false },
    { dataField: 'activityDate', dataType: 'datetime', visible: false },
    { dataField: 'userName', dataType: 'string', visible: false },
    { dataField: 'userRoleNameEn', dataType: 'string', visible: false },
    { dataField: 'userRoleNameFr', dataType: 'string', visible: false },
    // { dataField: 'userRoleNameEnFr', dataType: 'string', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.casefileactivities.${x.dataField}` })),
};

export const caseFileViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileNumber', dataType: 'string' },
    { dataField: 'householdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'eventNameEn', dataType: 'string', visible: false },
    { dataField: 'eventNameFr', dataType: 'string', visible: false },
    // { dataField: 'eventNameEnFr', dataType: 'string', visible: false },
    { dataField: 'eventStatusEn', dataType: 'string', visible: false },
    { dataField: 'eventStatusFr', dataType: 'string', visible: false },
    // { dataField: 'eventStatusEnFr', dataType: 'string', visible: false },
    { dataField: 'caseFileStatusEn', dataType: 'string', visible: false },
    { dataField: 'caseFileStatusFr', dataType: 'string', visible: false },
    // { dataField: 'caseFileStatusEnFr', dataType: 'string', visible: false },
    { dataField: 'triageEn', dataType: 'string', visible: false },
    { dataField: 'triageFr', dataType: 'string', visible: false },
    // { dataField: 'triageEnFr', dataType: 'string', visible: false },
    { dataField: 'registrationTypeEn', dataType: 'string', visible: false },
    { dataField: 'registrationTypeFr', dataType: 'string', visible: false },
    // { dataField: 'registrationTypeEnFr', dataType: 'string', visible: false },
    { dataField: 'isDuplicate', dataType: 'boolean', visible: false },
    { dataField: 'identityAuthenticationMethodEn', dataType: 'string', visible: false },
    { dataField: 'identityAuthenticationMethodFr', dataType: 'string', visible: false },
    // { dataField: 'identityAuthenticationMethodEnFr', dataType: 'string', visible: false },
    { dataField: 'identityAuthenticationStatusEn', dataType: 'string', visible: false },
    { dataField: 'identityAuthenticationStatusFr', dataType: 'string', visible: false },
    // { dataField: 'identityAuthenticationStatusEnFr', dataType: 'string', visible: false },
    { dataField: 'impactValidationMethodEn', dataType: 'string', visible: false },
    { dataField: 'impactValidationMethodFr', dataType: 'string', visible: false },
    // { dataField: 'impactValidationMethodEnFr', dataType: 'string', visible: false },
    { dataField: 'impactStatusValidationStatusEn', dataType: 'string', visible: false },
    { dataField: 'impactStatusValidationStatusFr', dataType: 'string', visible: false },
    // { dataField: 'impactStatusValidationStatusEnFr', dataType: 'string', visible: false },
    { dataField: 'registrationMethodEn', dataType: 'string', visible: false },
    { dataField: 'registrationMethodFr', dataType: 'string', visible: false },
    // { dataField: 'registrationMethodEnFr', dataType: 'string', visible: false },
    { dataField: 'registrationLocationEn', dataType: 'string', visible: false },
    { dataField: 'registrationLocationFr', dataType: 'string', visible: false },
    // { dataField: 'registrationLocationEnFr', dataType: 'string', visible: false },
    { dataField: 'householdImpactedCount', dataType: 'number', visible: false },
    { dataField: 'householdCount', dataType: 'number', visible: false },
    { dataField: 'caseLabel1', dataType: 'string', visible: false },
    { dataField: 'caseLabel2', dataType: 'string', visible: false },
    { dataField: 'caseLabel3', dataType: 'string', visible: false },
    { dataField: 'caseLabel4', dataType: 'string', visible: false },
    { dataField: 'consentCrcUserName', dataType: 'string', visible: false },
    { dataField: 'privacyDateTimeConsent', dataType: 'datetime', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.casefile.${x.dataField}` })),
};

export const householdViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'primaryBeneficiary', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'primaryBeneficiaryFirstName', dataType: 'string' },
    { dataField: 'primaryBeneficiaryLastName', dataType: 'string' },
    { dataField: 'registrationNumber', dataType: 'string', visible: false },
    { dataField: 'address_Observation', dataType: 'string', visible: false },
    { dataField: 'address_From', dataType: 'datetime', visible: false },
    { dataField: 'address_To', dataType: 'datetime', visible: false },
    { dataField: 'address_Country', dataType: 'string', visible: false },
    { dataField: 'address_StreetAddress', dataType: 'string', visible: false },
    { dataField: 'address_UnitSuite', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameEn', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameFr', dataType: 'string', visible: false },
    // { dataField: 'address_ProvinceNameEnFr', dataType: 'string', visible: false },
    { dataField: 'address_SpecifiedOtherProvince', dataType: 'string', visible: false },
    { dataField: 'address_City', dataType: 'string', visible: false },
    { dataField: 'address_PostalCode', dataType: 'string', visible: false },
    { dataField: 'address_Latitude', dataType: 'number', visible: false },
    { dataField: 'address_Longitude', dataType: 'number', visible: false },
    { dataField: 'householdStatusNameEn', dataType: 'string', visible: false },
    { dataField: 'householdStatusNameFr', dataType: 'string', visible: false },
    // { dataField: 'householdStatusNameEnFr', dataType: 'string', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.household.${x.dataField}` })),
};

export const personViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'householdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'isPrimary', dataType: 'boolean', visible: false },
    { dataField: 'firstName', dataType: 'string' },
    { dataField: 'lastName', dataType: 'string' },
    { dataField: 'middleName', dataType: 'string', visible: false },
    { dataField: 'preferredName', dataType: 'string', visible: false },
    { dataField: 'fullName', dataType: 'string', visible: false },
    { dataField: 'dateOfBirth', dataType: 'date', visible: false },
    { dataField: 'age', dataType: 'number', visible: false },
    { dataField: 'genderNameEn', dataType: 'string', visible: false },
    { dataField: 'genderNameFr', dataType: 'string', visible: false },
    // { dataField: 'genderNameEnFr', dataType: 'string', visible: false },
    { dataField: 'gender_SpecifiedOther', dataType: 'string', visible: false },
    { dataField: 'indigenousCommunityNameEn', dataType: 'string', visible: false },
    { dataField: 'indigenousCommunityNameFr', dataType: 'string', visible: false },
    // { dataField: 'indigenousCommunityNameEnFr', dataType: 'string', visible: false },
    { dataField: 'indigenousCommunity_SpecifiedOther', dataType: 'string', visible: false },
    { dataField: 'homePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'mobilePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'alternatePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'alternatePhoneNumberExtension', dataType: 'string', visible: false },
    { dataField: 'email', dataType: 'string', visible: false },
    { dataField: 'preferredLanguageNameEn', dataType: 'string', visible: false },
    { dataField: 'preferredLanguageNameFr', dataType: 'string', visible: false },
    // { dataField: 'preferredLanguageNameEnFr', dataType: 'string', visible: false },
    { dataField: 'primarySpokenLanguageNameEn', dataType: 'string', visible: false },
    { dataField: 'primarySpokenLanguageNameFr', dataType: 'string', visible: false },
    // { dataField: 'primarySpokenLanguageEnFr', dataType: 'string', visible: false },
    { dataField: 'primarySpokenLanguageOther', dataType: 'string', visible: false },
    { dataField: 'address_AddressTypeNameEn', dataType: 'string', visible: false },
    { dataField: 'address_AddressTypeNameFr', dataType: 'string', visible: false },
    // { dataField: 'address_AddressTypeNameEnFr', dataType: 'string', visible: false },
    { dataField: 'address_PlaceName', dataType: 'string', visible: false },
    { dataField: 'address_PlaceNumber', dataType: 'string', visible: false },
    { dataField: 'shelterLocationsNameEn', dataType: 'string', visible: false },
    { dataField: 'shelterLocationsNameFr', dataType: 'string', visible: false },
    // { dataField: 'shelterLocationsNameEnFr', dataType: 'string', visible: false },

    { dataField: 'address_From', dataType: 'datetime', visible: false },
    { dataField: 'address_To', dataType: 'datetime', visible: false },
    { dataField: 'address_Country', dataType: 'string', visible: false },
    { dataField: 'address_StreetAddress', dataType: 'string', visible: false },
    { dataField: 'address_UnitSuite', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameEn', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameFr', dataType: 'string', visible: false },
    // { dataField: 'address_ProvinceNameEnFr', dataType: 'string', visible: false },
    { dataField: 'address_SpecifiedOtherProvince', dataType: 'string', visible: false },
    { dataField: 'address_City', dataType: 'string', visible: false },
    { dataField: 'address_PostalCode', dataType: 'string', visible: false },
    { dataField: 'address_Latitude', dataType: 'number', visible: false },
    { dataField: 'address_Longitude', dataType: 'number', visible: false },
    { dataField: 'address_CheckIn', dataType: 'datetime', visible: false },
    { dataField: 'address_CheckOut', dataType: 'datetime', visible: false },
    { dataField: 'address_CrcProvided', dataType: 'boolean', visible: false },
    { dataField: 'address_EventId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.person.${x.dataField}` })),
};

export const programsPerCaseFileCsvViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'programNameEn', dataType: 'string', visible: false },
    { dataField: 'programNameFr', dataType: 'string', visible: false },
    // { dataField: 'programNameEnFr', dataType: 'string', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.programsPerCaseFileCsv.${x.dataField}` })),
};

export const caseFileAuthenticationIdsCsvViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'csvAuthenticationIdNameEn', dataType: 'string', visible: false },
    { dataField: 'csvAuthenticationIdNameFr', dataType: 'string', visible: false },
    // { dataField: 'csvAuthenticationIdNameEnFr', dataType: 'string', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.caseFileAuthenticationIdsCsv.${x.dataField}` })),
};

export const caseFileTagsCsvViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'csvTagNameEn', dataType: 'string', visible: false },
    { dataField: 'csvTagNameFr', dataType: 'string', visible: false },
    // { dataField: 'csvTagNameEnFr', dataType: 'string', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.caseFileTagsCsv.${x.dataField}` })),
};

export const financialAssistancePaymentViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistanceTableId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'tableNameEn', dataType: 'string', visible: false },
    { dataField: 'tableNameFr', dataType: 'string', visible: false },
    // { dataField: 'tableNameEnFr', dataType: 'string', visible: false },
    { dataField: 'programNameEn', dataType: 'string', visible: false },
    { dataField: 'programNameFr', dataType: 'string', visible: false },
    // { dataField: 'programNameEnFr', dataType: 'string', visible: false },
    { dataField: 'name', dataType: 'string', visible: true },
    { dataField: 'description', dataType: 'string', visible: false },
    { dataField: 'approvalStatusNameEn', dataType: 'string', visible: false },
    { dataField: 'approvalStatusNameFr', dataType: 'string', visible: false },
    // { dataField: 'approvalStatusNameEnFr', dataType: 'string', visible: false },
    { dataField: 'approvalActionNameEn', dataType: 'string', visible: false },
    { dataField: 'approvalActionNameFr', dataType: 'string', visible: false },
    // { dataField: 'approvalActionNameEnFr', dataType: 'string', visible: false },
    { dataField: 'rationale', dataType: 'string', visible: false },
    { dataField: 'submittedByName', dataType: 'string', visible: false },
    { dataField: 'submittedToName', dataType: 'string', visible: false },
    { dataField: 'initialSubmitterName', dataType: 'string', visible: false },
    { dataField: 'submissionStartedDate', dataType: 'datetime', visible: false },
    { dataField: 'revisedCreateDate', dataType: 'datetime', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'createdByRoleNameEn', dataType: 'string', visible: false },
    { dataField: 'createdByRoleNameFr', dataType: 'string', visible: false },
    // { dataField: 'createdByRoleNameEnFr', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedByRoleNameEn', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedByRoleNameFr', dataType: 'string', visible: false },
    // { dataField: 'lastUpdatedByRoleNameEnFr', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.financialassistancepayment.${x.dataField}` })),
};

export const financialAssistancePaymentGroupViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistancePaymentId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'paymentModalityNameEn', dataType: 'string', visible: false },
    { dataField: 'paymentModalityNameFr', dataType: 'string', visible: false },
    // { dataField: 'paymentModalityNameEnFr', dataType: 'string', visible: false },
    { dataField: 'payeeTypeNameEn', dataType: 'string', visible: false },
    { dataField: 'payeeTypeNameFr', dataType: 'string', visible: false },
    // { dataField: 'payeeTypeNameEnFr', dataType: 'string', visible: false },
    { dataField: 'payeeName', dataType: 'string', visible: false },
    { dataField: 'paymentStatusNameEn', dataType: 'string', visible: false },
    { dataField: 'paymentStatusNameFr', dataType: 'string', visible: false },
    // { dataField: 'paymentStatusEnFr', dataType: 'string', visible: false },
    { dataField: 'cancellationReasonNameEn', dataType: 'string', visible: false },
    { dataField: 'cancellationReasonNameFr', dataType: 'string', visible: false },
    // { dataField: 'cancellationReasonEnFr', dataType: 'string', visible: false },
    { dataField: 'cancellationDate', dataType: 'datetime', visible: false },
    { dataField: 'cancellationBy', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.financialassistancepaymentgroup.${x.dataField}` })),
};

export const financialAssistancePaymentLineViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistancePaymentId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistancePaymentGroupId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'itemNameEn', dataType: 'string', visible: false },
    { dataField: 'itemNameFr', dataType: 'string', visible: false },
    // { dataField: 'itemNameEnFr', dataType: 'string', visible: false },
    { dataField: 'subItemNameEn', dataType: 'string', visible: false },
    { dataField: 'subItemNameFr', dataType: 'string', visible: false },
    // { dataField: 'subItemNameEnFr', dataType: 'string', visible: false },
    { dataField: 'documentReceived', dataType: 'boolean', visible: false },
    { dataField: 'amount', dataType: 'number', visible: true },
    { dataField: 'actualAmount', dataType: 'number', visible: false },
    { dataField: 'relatedNumber', dataType: 'string', visible: false },
    { dataField: 'careOf', dataType: 'string', visible: false },
    { dataField: 'address_Country', dataType: 'string', visible: false },
    { dataField: 'address_StreetAddress', dataType: 'string', visible: false },
    { dataField: 'address_UnitSuite', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameEn', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameFr', dataType: 'string', visible: false },
    // { dataField: 'address_ProvinceNameEnFr', dataType: 'string', visible: false },
    { dataField: 'address_SpecifiedOtherProvince', dataType: 'string', visible: false },
    { dataField: 'address_City', dataType: 'string', visible: false },
    { dataField: 'address_PostalCode', dataType: 'string', visible: false },
    { dataField: 'address_Latitude', dataType: 'number', visible: false },
    { dataField: 'address_Longitude', dataType: 'number', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.financialassistancepaymentline.${x.dataField}` })),
};

export const financialAssistancePaymentSummaryViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'totalAmountUnapproved', dataType: 'number', visible: false },
    { dataField: 'totalAmountCommitted', dataType: 'number', visible: false },
    { dataField: 'totalAmountCompleted', dataType: 'number', visible: false },
    { dataField: 'grandTotal', dataType: 'number', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.financialAssistancePaymentSummary.${x.dataField}` })),
};

export const caseFileHouseholdPrimaryDs : IDatasourceSettings = {
  url: 'common/data-providers/household-primary',
  reportingTopic: ReportingTopic.HouseholdPrimary,
  key: ['casefile.id'],
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(householdViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'primaryBeneficiaryFirstName' && c.dataField !== 'primaryBeneficiaryLastName')
              .map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(caseFileAuthenticationIdsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileAuthenticationIdsCsv.${x.dataField}` }))),
    ...(caseFileTagsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileTagsCsv.${x.dataField}` }))),
    ...(financialAssistancePaymentSummaryViewDS.columns.filter((c) => c.dataField !== 'caseFileId')
              .map((x) => ({ ...x, dataField: `financialAssistancePaymentSummary.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `primaryMember.${x.dataField}` }))),
    ...(programsPerCaseFileCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `programsPerCaseFileCsv.${x.dataField}` }))),
  ],
};

export const householdMembersDs : IDatasourceSettings = {
  url: 'common/data-providers/household-members',
  reportingTopic: ReportingTopic.HouseholdMembers,
  key: ['casefile.id', 'person.id'],
  columns: [
    ...(caseFileViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(householdViewDs.columns.map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(caseFileAuthenticationIdsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileAuthenticationIdsCsv.${x.dataField}` }))),
    ...(caseFileTagsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileTagsCsv.${x.dataField}` }))),
  ],
};

export const caseFileActivitiesDs : IDatasourceSettings = {
  url: 'common/data-providers/case-file-activities',
  reportingTopic: ReportingTopic.CaseFileActivities,
  key: ['activity.id'],
  columns: [
    ...(caseFileActivitiesViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `activity.${x.dataField}` }))),
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `primaryMember.${x.dataField}` }))),
    ...(caseFileAuthenticationIdsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileAuthenticationIdsCsv.${x.dataField}` }))),
    ...(caseFileTagsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileTagsCsv.${x.dataField}` }))),
  ],
};

export const financialAssistancePaymentLineDs : IDatasourceSettings = {
  url: 'common/data-providers/financial-assistance-payment-line',
  reportingTopic: ReportingTopic.PaymentLine,
  key: ['paymentLine.id'],
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(financialAssistancePaymentLineViewDs.columns.filter((c) => c.dataField !== 'financialAssistancePaymentId' && c.dataField !== 'financialAssistancePaymentGroupId')
      .map((x) => ({ ...x, dataField: `paymentLine.${x.dataField}` }))),
    ...(financialAssistancePaymentViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `payment.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(financialAssistancePaymentGroupViewDs.columns.filter((c) => c.dataField !== 'caseFileId' && c.dataField !== 'financialAssistancePaymentId')
      .map((x) => ({ ...x, dataField: `paymentGroup.${x.dataField}` }))),
  ],
};

export const datasources = [householdMembersDs, caseFileHouseholdPrimaryDs, caseFileActivitiesDs, financialAssistancePaymentLineDs];
