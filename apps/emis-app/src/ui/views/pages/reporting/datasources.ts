import { ReportingTopic } from '@libs/entities-lib/reporting';
import { Column } from 'devextreme/ui/data_grid_types';

export enum LookupType {
  enumEn,
  enumFr,
  optionItemEn,
  optionItemFr,
  eventFr,
  eventEn,
  programNameEn,
  programNameFr,
}

export interface ExtendedColumn extends Column<any, any> {
  lookupType?: LookupType;
  lookupKey?: string;
  lookupSubItems?: boolean;

  asUtcDate?: boolean; // whether we want to show the date field in the original UTC or as local.  most dates should be local.
}

export interface IDatasourceBase {
  columns: ExtendedColumn[];
}

export interface IDatasourceSettings extends IDatasourceBase {
  url: string,
  reportingTopic: ReportingTopic;
  columns: ExtendedColumn[]
  key: Record<string, 'String' | 'Int32' | 'Int64' | 'Guid' | 'Boolean' | 'Single' | 'Decimal'>;
}

export const caseNoteViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: true },
    { dataField: 'subject', dataType: 'string' },
    { dataField: 'description', dataType: 'string', visible: false },
    { dataField: 'caseNoteCategoryNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'CaseNoteCategory' },
    { dataField: 'caseNoteCategoryNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'CaseNoteCategory' },
    { dataField: 'userCreatedByName', dataType: 'string', visible: false },
    { dataField: 'userUpdatedByName', dataType: 'string', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.casenote.${x.dataField}` })),
};

export const documentViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: true },
    { dataField: 'name', dataType: 'string' },
    { dataField: 'note', dataType: 'string', visible: false },
    { dataField: 'documentCategoryNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'DocumentCategory' },
    { dataField: 'documentCategoryNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'DocumentCategory' },
    { dataField: 'documentStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'DocumentStatus' },
    { dataField: 'documentStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'DocumentStatus' },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: true },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.document.${x.dataField}` })),
};

export const caseFileActivitiesViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'activityTypeNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ActivityType' },
    { dataField: 'activityTypeNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ActivityType' },
    { dataField: 'activityDate', dataType: 'datetime', visible: false },
    { dataField: 'userName', dataType: 'string', visible: false },
    { dataField: 'userRoleNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'userRoleNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.casefileactivities.${x.dataField}` })),
};

export const latestCaseFileActivitiesViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'activityTypeNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ActivityType' },
    { dataField: 'activityTypeNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ActivityType' },
    { dataField: 'activityDate', dataType: 'datetime', visible: false },
    { dataField: 'userName', dataType: 'string', visible: false },
    { dataField: 'userRoleNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'userRoleNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'daysSinceActivity', dataType: 'int', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.latestcasefileactivities.${x.dataField}` })),
};

export const caseFileViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileNumber', dataType: 'string' },
    { dataField: 'householdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'eventNameEn', dataType: 'string', visible: false, lookupType: LookupType.eventEn },
    { dataField: 'eventNameFr', dataType: 'string', visible: false, lookupType: LookupType.eventFr },
    { dataField: 'eventStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'EventStatus' },
    { dataField: 'eventStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'EventStatus' },
    { dataField: 'caseFileStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'CaseFileStatus' },
    { dataField: 'caseFileStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'CaseFileStatus' },
    { dataField: 'triageEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'Triage' },
    { dataField: 'triageFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'Triage' },
    { dataField: 'registrationTypeEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'RegistrationType' },
    { dataField: 'registrationTypeFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'RegistrationType' },
    { dataField: 'identityAuthenticationMethodEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'IdentityAuthenticationMethod' },
    { dataField: 'identityAuthenticationMethodFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'IdentityAuthenticationMethod' },
    { dataField: 'identityAuthenticationStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'IdentityAuthenticationStatus' },
    { dataField: 'identityAuthenticationStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'IdentityAuthenticationStatus' },
    { dataField: 'exceptionalAuthenticationTypeNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'ExceptionalAuthenticationType' },
    { dataField: 'exceptionalAuthenticationTypeNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'ExceptionalAuthenticationType' },
    { dataField: 'exceptionalAuthenticationTypeSpecifiedOther', dataType: 'string', visible: false },
    { dataField: 'tier2StateEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'Tier2State' },
    { dataField: 'tier2StateFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'Tier2State' },
    { dataField: 'impactValidationMethodEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ImpactValidationMethod' },
    { dataField: 'impactValidationMethodFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ImpactValidationMethod' },
    { dataField: 'impactStatusValidationStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ValidationOfImpactStatus' },
    { dataField: 'impactStatusValidationStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ValidationOfImpactStatus' },
    { dataField: 'registrationMethodEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'RegistrationMethod' },
    { dataField: 'registrationMethodFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'RegistrationMethod' },
    { dataField: 'registrationLocationEn', dataType: 'string', visible: false },
    { dataField: 'registrationLocationFr', dataType: 'string', visible: false },
    { dataField: 'householdImpactedCount', dataType: 'number', visible: false },
    { dataField: 'householdCount', dataType: 'number', visible: false },
    { dataField: 'caseLabel1', dataType: 'string', visible: false },
    { dataField: 'caseLabel2', dataType: 'string', visible: false },
    { dataField: 'caseLabel3', dataType: 'string', visible: false },
    { dataField: 'caseLabel4', dataType: 'string', visible: false },
    { dataField: 'recoveryPlan_HasRecoveryPlan', dataType: 'boolean', visible: false },
    { dataField: 'recoveryPlan_CrcProvided', dataType: 'boolean', visible: false },
    { dataField: 'recoveryPlan_StartDate', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'consentCrcUserName', dataType: 'string', visible: false },
    { dataField: 'privacyDateTimeConsent', dataType: 'datetime', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.casefile.${x.dataField}` })),
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
    { dataField: 'address_ProvinceNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'Province' },
    { dataField: 'address_ProvinceNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'Province' },
    { dataField: 'address_SpecifiedOtherProvince', dataType: 'string', visible: false },
    { dataField: 'address_City', dataType: 'string', visible: false },
    { dataField: 'address_PostalCode', dataType: 'string', visible: false },
    { dataField: 'address_Latitude', dataType: 'number', visible: false },
    { dataField: 'address_Longitude', dataType: 'number', visible: false },
    { dataField: 'householdStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'HouseholdStatus' },
    { dataField: 'householdStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'HouseholdStatus' },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.household.${x.dataField}` })),
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
    { dataField: 'dateOfBirth', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'age', dataType: 'number', visible: false },
    { dataField: 'genderNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Gender' },
    { dataField: 'genderNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Gender' },
    { dataField: 'gender_SpecifiedOther', dataType: 'string', visible: false },
    { dataField: 'indigenousCommunityNameEn', dataType: 'string', visible: false },
    { dataField: 'indigenousCommunityNameFr', dataType: 'string', visible: false },
    { dataField: 'indigenousCommunity_SpecifiedOther', dataType: 'string', visible: false },
    { dataField: 'homePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'mobilePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'alternatePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'alternatePhoneNumberExtension', dataType: 'string', visible: false },
    { dataField: 'email', dataType: 'string', visible: false },
    { dataField: 'preferredLanguageNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'PreferredLanguage' },
    { dataField: 'preferredLanguageNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'PreferredLanguage' },
    { dataField: 'primarySpokenLanguageNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'PrimarySpokenLanguage' },
    { dataField: 'primarySpokenLanguageNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'PrimarySpokenLanguage' },
    { dataField: 'primarySpokenLanguageOther', dataType: 'string', visible: false },
    { dataField: 'address_AddressTypeNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'CurrentAddressType' },
    { dataField: 'address_AddressTypeNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'CurrentAddressType' },
    { dataField: 'address_PlaceName', dataType: 'string', visible: false },
    { dataField: 'address_PlaceNumber', dataType: 'string', visible: false },
    { dataField: 'shelterLocationId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'shelterLocationsNameEn', dataType: 'string', visible: false },
    { dataField: 'shelterLocationsNameFr', dataType: 'string', visible: false },

    { dataField: 'address_From', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'address_To', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'address_Country', dataType: 'string', visible: false },
    { dataField: 'address_StreetAddress', dataType: 'string', visible: false },
    { dataField: 'address_UnitSuite', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'Province' },
    { dataField: 'address_ProvinceNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'Province' },
    { dataField: 'address_SpecifiedOtherProvince', dataType: 'string', visible: false },
    { dataField: 'address_City', dataType: 'string', visible: false },
    { dataField: 'address_PostalCode', dataType: 'string', visible: false },
    { dataField: 'address_Latitude', dataType: 'number', visible: false },
    { dataField: 'address_Longitude', dataType: 'number', visible: false },
    { dataField: 'address_CheckIn', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'address_CheckOut', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'address_CrcProvided', dataType: 'boolean', visible: false },
    { dataField: 'address_EventId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.person.${x.dataField}` })),
};

export const personAddressHistoryViewDs : IDatasourceBase = {
  columns: personViewDs.columns.map((x) => ({
    ...x,
    caption: x.dataField.startsWith('address_') || x.dataField.startsWith('shelterLocation') ? `ds.personAddressHistory.${x.dataField}` : x.caption,
  })),
};

export const taskViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'closedDate', dataType: 'datetime', visible: false },
    { dataField: 'description', dataType: 'string' },
    { dataField: 'isUrgent', dataType: 'boolean', visible: false },
    { dataField: 'assignedTeamName', dataType: 'string' },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'taskNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'TaskCategory' },
    { dataField: 'taskNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'TaskCategory' },
    { dataField: 'taskCategoryEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'TaskCategory', lookupSubItems: true },
    { dataField: 'taskCategoryFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'TaskCategory', lookupSubItems: true },
    { dataField: 'taskStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'TaskStatus' },
    { dataField: 'taskStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'TaskStatus' },
    { dataField: 'lastActionTakenNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ActionTaken' },
    { dataField: 'lastActionTakenNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ActionTaken' },
    { dataField: 'userWorkingOn', dataType: 'string', visible: false },
    { dataField: 'dueDate', dataType: 'date', asUtcDate: true, visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.task.${x.dataField}` })),
};

export const taskHistoryViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'taskId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'rationale', dataType: 'string', visible: false },
    { dataField: 'roleNameEn', dataType: 'string', lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true, visible: false },
    { dataField: 'roleNameFr', dataType: 'string', lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true, visible: false },
    { dataField: 'userName', dataType: 'string', visible: false },
    { dataField: 'dateOfAction', dataType: 'datetime' },
    { dataField: 'currentAssignedTeamName', dataType: 'string', visible: false },
    { dataField: 'previousAssignedTeamName', dataType: 'string', visible: false },
    { dataField: 'taskStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'TaskStatus' },
    { dataField: 'taskStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'TaskStatus' },
    { dataField: 'actionTakenNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ActionTaken' },
    { dataField: 'actionTakenNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ActionTaken' },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.taskHistory.${x.dataField}` })),
};

export const programsPerCaseFileCsvViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'programNameEn', dataType: 'string', visible: false, lookupType: LookupType.programNameEn },
    { dataField: 'programNameFr', dataType: 'string', visible: false, lookupType: LookupType.programNameFr },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.programsPerCaseFileCsv.${x.dataField}` })),
};

export const caseFileAuthenticationIdsCsvViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'csvAuthenticationIdNameEn', dataType: 'string', visible: false },
    { dataField: 'csvAuthenticationIdNameFr', dataType: 'string', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.caseFileAuthenticationIdsCsv.${x.dataField}` })),
};

export const caseFileTagsCsvViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'csvTagNameEn', dataType: 'string', visible: false },
    { dataField: 'csvTagNameFr', dataType: 'string', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.caseFileTagsCsv.${x.dataField}` })),
};

export const financialAssistancePaymentViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistanceTableId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'tableNameEn', dataType: 'string', visible: false },
    { dataField: 'tableNameFr', dataType: 'string', visible: false },
    { dataField: 'programNameEn', dataType: 'string', visible: false, lookupType: LookupType.programNameEn },
    { dataField: 'programNameFr', dataType: 'string', visible: false, lookupType: LookupType.programNameFr },
    { dataField: 'name', dataType: 'string', visible: true },
    { dataField: 'description', dataType: 'string', visible: false },
    { dataField: 'approvalStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ApprovalStatus' },
    { dataField: 'approvalStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ApprovalStatus' },
    { dataField: 'approvalActionNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ApprovalAction' },
    { dataField: 'approvalActionNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ApprovalAction' },
    { dataField: 'rationale', dataType: 'string', visible: false },
    { dataField: 'submittedByName', dataType: 'string', visible: false },
    { dataField: 'submittedToName', dataType: 'string', visible: false },
    { dataField: 'initialSubmitterName', dataType: 'string', visible: false },
    { dataField: 'submissionStartedDate', dataType: 'datetime', visible: false },
    { dataField: 'revisedCreateDate', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'createdByRoleNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'createdByRoleNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedByRoleNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'lastUpdatedByRoleNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'eTag', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.financialassistancepayment.${x.dataField}` })),
};

export const financialAssistancePaymentGroupViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistancePaymentId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'paymentModalityNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'PaymentModality' },
    { dataField: 'paymentModalityNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'PaymentModality' },
    { dataField: 'payeeTypeNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'PayeeType' },
    { dataField: 'payeeTypeNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'PayeeType' },
    { dataField: 'payeeName', dataType: 'string', visible: false },
    { dataField: 'paymentStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'PaymentStatus' },
    { dataField: 'paymentStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'PaymentStatus' },
    { dataField: 'dateCompleted', dataType: 'datetime', visible: false },
    { dataField: 'cancellationReasonNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'CancellationReason' },
    { dataField: 'cancellationReasonNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'CancellationReason' },
    { dataField: 'cancellationDate', dataType: 'datetime', visible: false },
    { dataField: 'cancelledBy', dataType: 'string', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.financialassistancepaymentgroup.${x.dataField}` })),
};

export const financialAssistancePaymentLineViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistancePaymentId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'financialAssistancePaymentGroupId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'itemNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'FinancialAssistanceCategory' },
    { dataField: 'itemNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'FinancialAssistanceCategory' },
    { dataField: 'subItemNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'FinancialAssistanceCategory', lookupSubItems: true },
    { dataField: 'subItemNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'FinancialAssistanceCategory', lookupSubItems: true },
    { dataField: 'documentReceived', dataType: 'boolean', visible: false },
    { dataField: 'amount', dataType: 'number', visible: true },
    { dataField: 'actualAmount', dataType: 'number', visible: false },
    { dataField: 'relatedNumber', dataType: 'string', visible: false },
    { dataField: 'careOf', dataType: 'string', visible: false },
    { dataField: 'address_Country', dataType: 'string', visible: false },
    { dataField: 'address_StreetAddress', dataType: 'string', visible: false },
    { dataField: 'address_UnitSuite', dataType: 'string', visible: false },
    { dataField: 'address_ProvinceNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'Province' },
    { dataField: 'address_ProvinceNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'Province' },
    { dataField: 'address_SpecifiedOtherProvince', dataType: 'string', visible: false },
    { dataField: 'address_City', dataType: 'string', visible: false },
    { dataField: 'address_PostalCode', dataType: 'string', visible: false },
    { dataField: 'address_Latitude', dataType: 'number', visible: false },
    { dataField: 'address_Longitude', dataType: 'number', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
    { dataField: 'paymentStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'PaymentLineStatus' },
    { dataField: 'paymentStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'PaymentLineStatus' },
    { dataField: 'cancellationDate', dataType: 'datetime', visible: false },
    { dataField: 'cancelledBy', dataType: 'string', visible: false },
    { dataField: 'cancellationReasonNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'CancellationReason' },
    { dataField: 'cancellationReasonNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'CancellationReason' },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.financialassistancepaymentline.${x.dataField}` })),
};

export const potentialDuplicateViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'householdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'registrationNumber', dataType: 'string', visible: true },
    { dataField: 'eventId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'eventNameEn', dataType: 'string', visible: false, lookupType: LookupType.eventEn },
    { dataField: 'eventNameFr', dataType: 'string', visible: false, lookupType: LookupType.eventFr },
    { dataField: 'duplicateEventId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'duplicateEventNameEn', dataType: 'string', visible: false, lookupType: LookupType.eventEn },
    { dataField: 'duplicateEventNameFr', dataType: 'string', visible: false, lookupType: LookupType.eventFr },
    { dataField: 'memberFirstName', dataType: 'string', visible: false },
    { dataField: 'memberLastName', dataType: 'string', visible: false },
    { dataField: 'primaryBeneficiaryFirstName', dataType: 'string', visible: false },
    { dataField: 'primaryBeneficiaryLastName', dataType: 'string', visible: false },
    { dataField: 'homeAddressEn', dataType: 'string', visible: false },
    { dataField: 'homeAddressFr', dataType: 'string', visible: false },
    { dataField: 'email', dataType: 'string', visible: false },
    { dataField: 'homePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'mobilePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'alternatePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'householdStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'HouseholdStatus' },
    { dataField: 'householdStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'HouseholdStatus' },
    { dataField: 'potentialDuplicateHouseholdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'potentialDuplicateRegistrationNumber', dataType: 'string', visible: true },
    { dataField: 'potentialDuplicateHomeAddressEn', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicateHomeAddressFr', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicatePrimaryBeneficiaryFirstName', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicatePrimaryBeneficiaryLastName', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicateEmail', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicateHomePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicateMobilePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicateAlternatePhoneNumber', dataType: 'string', visible: false },
    { dataField: 'potentialDuplicateHouseholdStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'HouseholdStatus' },
    { dataField: 'potentialDuplicateHouseholdStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'HouseholdStatus' },
    { dataField: 'duplicateReasonsEn', dataType: 'string', visible: false },
    { dataField: 'duplicateReasonsFr', dataType: 'string', visible: false },
    { dataField: 'duplicateStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'DuplicateStatus' },
    { dataField: 'duplicateStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'DuplicateStatus' },
    { dataField: 'caseFileNumber', dataType: 'string', visible: false },
    { dataField: 'caseFileCreatedOn', dataType: 'datetime', visible: false },
    { dataField: 'duplicateCaseFileNumber', dataType: 'string', visible: false },
    { dataField: 'duplicateCaseFileCreatedOn', dataType: 'datetime', visible: false },
    { dataField: 'matchedMemberFirstName', dataType: 'string', visible: false },
    { dataField: 'matchedMemberLastName', dataType: 'string', visible: false },
    { dataField: 'matchedMemberFullName', dataType: 'string', visible: false },
    { dataField: 'matchedMemberIsPrimary', dataType: 'boolean', visible: false },
    { dataField: 'matchedMemberDateOfBirth', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'matchedMemberAge', dataType: 'number', visible: false },
    { dataField: 'matchedDuplicateMemberFirstName', dataType: 'string', visible: false },
    { dataField: 'matchedDuplicateMemberLastName', dataType: 'string', visible: false },
    { dataField: 'matchedDuplicateMemberFullName', dataType: 'string', visible: false },
    { dataField: 'matchedDuplicateMemberDateOfBirth', dataType: 'date', visible: false, asUtcDate: true },
    { dataField: 'matchedDuplicateMemberAge', dataType: 'number', visible: false },
    { dataField: 'matchedDuplicateMemberIsPrimary', dataType: 'boolean', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.potentialDuplicateViewDs.${x.dataField}` })),
};

export const caseFileLifetimeActivitiesViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'registrationDate', dataType: 'datetime', visible: false },
    { dataField: 'inactiveDate', dataType: 'datetime', visible: false },
    { dataField: 'closedDate', dataType: 'datetime', visible: false },
    { dataField: 'archivedDate', dataType: 'datetime', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.caseFileLifetimeActivitiesViewDS.${x.dataField}` })),
};

export const householdActivitiesViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'householdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileNumber', dataType: 'string', visible: true },
    { dataField: 'eventNameEn', dataType: 'string', visible: false, lookupType: LookupType.eventEn },
    { dataField: 'eventNameFr', dataType: 'string', visible: false, lookupType: LookupType.eventFr },
    { dataField: 'activityTypeEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'HouseholdActivityType' },
    { dataField: 'activityTypeFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'HouseholdActivityType' },
    { dataField: 'dateOfChange', dataType: 'datetime', visible: true },
    { dataField: 'editedBy', dataType: 'string', visible: true },
    { dataField: 'previousDetailsEn', dataType: 'string', visible: false, cssClass: 'wrapped-column' },
    { dataField: 'newDetailsEn', dataType: 'string', visible: false, cssClass: 'wrapped-column' },
    { dataField: 'previousDetailsFr', dataType: 'string', visible: false, cssClass: 'wrapped-column' },
    { dataField: 'newDetailsFr', dataType: 'string', visible: false, cssClass: 'wrapped-column' },
    { dataField: 'previousDetailsJson', dataType: 'string', visible: false, cssClass: 'wrapped-column' },
    { dataField: 'newDetailsJson', dataType: 'string', visible: false, cssClass: 'wrapped-column' },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.householdActivitiesViewDS.${x.dataField}` })),
};

export const financialAssistanceSummaryByPaymentGroupViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'financialAssistancePaymentGroupId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'totalAmountUnapproved', dataType: 'number', visible: false },
    { dataField: 'totalAmountCommitted', dataType: 'number', visible: false },
    { dataField: 'totalAmountCompleted', dataType: 'number', visible: false },
    { dataField: 'grandTotal', dataType: 'number', visible: false },
    { dataField: 'relatedNumberCsv', dataType: 'string', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.financialAssistanceSummaryByPaymentGroupViewDS.${x.dataField}` })),
};

export const financialAssistancePaymentSummaryViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'totalAmountUnapproved', dataType: 'number', visible: false },
    { dataField: 'totalAmountCommitted', dataType: 'number', visible: false },
    { dataField: 'totalAmountCompleted', dataType: 'number', visible: false },
    { dataField: 'grandTotal', dataType: 'number', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.financialAssistancePaymentSummary.${x.dataField}` })),
};

export const referralViewDs : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'name', dataType: 'string' },
    { dataField: 'referralTypeNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'ReferralType' },
    { dataField: 'referralTypeNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'ReferralType' },
    { dataField: 'referralOutcomeStatusNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'ReferralOutcomeStatus' },
    { dataField: 'referralOutcomeStatusNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'ReferralOutcomeStatus' },
    { dataField: 'note', dataType: 'string', visible: false },
    { dataField: 'referralMethodNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'ReferralMethod' },
    { dataField: 'referralMethodNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'ReferralMethod' },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
    { dataField: 'createdBy', dataType: 'string', visible: false },
    { dataField: 'createdByRoleNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'createdByRoleNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'lastUpdatedBy', dataType: 'string', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.referral.${x.dataField}` })),
};

export const userAccountViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'roleNameEn', dataType: 'string', visible: false, lookupType: LookupType.optionItemEn, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'roleNameFr', dataType: 'string', visible: false, lookupType: LookupType.optionItemFr, lookupKey: 'Role', lookupSubItems: true },
    { dataField: 'accessLevelNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'AccessLevels' },
    { dataField: 'accessLevelNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'AccessLevels' },
    { dataField: 'isInactive', dataType: 'boolean', visible: false },
    { dataField: 'displayName', dataType: 'string' },
    { dataField: 'emailAddress', dataType: 'string', visible: false },
    { dataField: 'phoneNumber', dataType: 'string', visible: false },
    { dataField: 'preferredLanguage', dataType: 'string', visible: false },
    { dataField: 'givenName', dataType: 'string', visible: false },
    { dataField: 'surname', dataType: 'string', visible: false },
    { dataField: 'userPrincipalName', dataType: 'string', visible: false },
    { dataField: 'createDate', dataType: 'datetime', visible: false },
    { dataField: 'updateDate', dataType: 'datetime', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.userAccount.${x.dataField}` })),
};

export const teamDetailViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'id', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'name', dataType: 'string' },
    { dataField: 'primaryContactId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'primaryContact', dataType: 'string', visible: false },
    { dataField: 'isActive', dataType: 'boolean', visible: false },
    { dataField: 'csvEventNameEn', dataType: 'string', visible: false },
    { dataField: 'csvEventNameFr', dataType: 'string', visible: false },
  ] as ExtendedColumn[]).map((x) => ({ ...x, caption: `ds.teamDetail.${x.dataField}` })),
};

export const caseFileAuthenticationIdViewDS : IDatasourceBase = {
  columns: ([
    { dataField: 'caseFileId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'authenticationIdId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false, visible: false },
    { dataField: 'authenticationIdNameEn', dataType: 'string' },
    { dataField: 'authenticationIdNameFr', dataType: 'string' },
    // { dataField: 'csvAuthenticationIdNameEnFr', dataType: 'string', visible: false },
    { dataField: 'authenticationIdSpecifiedOther', dataType: 'string', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.caseFileAuthenticationId.${x.dataField}` })),
};

export const eTransferPaymentConfirmationViewDS: IDatasourceBase = {
  columns: ([
    { dataField: 'financialAssistancePaymentGroupId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'financialAssistancePaymentId', dataType: 'string', allowHeaderFiltering: false, allowFiltering: false, allowSearch: false },
    { dataField: 'amount', dataType: 'number', visible: false },
    { dataField: 'paymentType', dataType: 'string', visible: false },
    { dataField: 'senderAccountIdentifier', dataType: 'string', visible: false },
    { dataField: 'senderAccountType', dataType: 'string', visible: false },
    { dataField: 'receiverAccountIdentifier', dataType: 'string', visible: false },
    { dataField: 'receiverAccountType', dataType: 'string', visible: false },
    { dataField: 'httpStatusCode', dataType: 'number', visible: false },
    { dataField: 'responseStatusEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'RbcResponseStatus' },
    { dataField: 'responseStatusFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'RbcResponseStatus' },
    { dataField: 'isSuccess', dataType: 'boolean', visible: false },
    { dataField: 'pinOrAutoDepositEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'RbcDepositMethod' },
    { dataField: 'pinOrAutoDepositFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'RbcDepositMethod' },
    { dataField: 'referenceNumber', dataType: 'string', visible: false },
    { dataField: 'failedReasonCode', dataType: 'string', visible: false },
    { dataField: 'failedReasonMessage', dataType: 'string', visible: false },
    { dataField: 'requestId', dataType: 'string', visible: false },
    { dataField: 'bankNameEn', dataType: 'string', visible: false, lookupType: LookupType.enumEn, lookupKey: 'Bank' },
    { dataField: 'bankNameFr', dataType: 'string', visible: false, lookupType: LookupType.enumFr, lookupKey: 'Bank' },
    { dataField: 'autoDepositEnabled', dataType: 'boolean', visible: false },
    { dataField: 'sentTimestamp', dataType: 'datetime', visible: false },
  ] as Column<any, any>[]).map((x) => ({ ...x, caption: `ds.eTransferPaymentConfirmation.${x.dataField}` })),
};

export const teamTaskDs : IDatasourceSettings = {
  url: 'common/data-providers/team-tasks',
  reportingTopic: ReportingTopic.Tasks,
  key: { taskId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(taskViewDS.columns.filter((c) => c.dataField !== 'caseFileId')
              .map((x) => ({ ...x, dataField: `task.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'householdId')
              .map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
  ],
};

export const teamTaskHistoryDs : IDatasourceSettings = {
  url: 'common/data-providers/team-tasks-history',
  reportingTopic: ReportingTopic.TasksHistory,
  key: { taskId: 'Guid', dateOfAction: 'String' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(taskViewDS.columns.filter((c) => c.dataField !== 'caseFileId')
              .map((x) => ({ ...x, dataField: `task.${x.dataField}` }))),
    ...(taskHistoryViewDS.columns.filter((c) => c.dataField !== 'taskId')
              .map((x) => ({ ...x, dataField: `taskHistory.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'householdId')
              .map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
  ],
};

export const caseFileHouseholdPrimaryDs : IDatasourceSettings = {
  url: 'common/data-providers/household-primary',
  reportingTopic: ReportingTopic.HouseholdPrimary,
  key: { caseFileId: 'Guid' },
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
  key: { caseFileId: 'Guid', memberId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(householdViewDs.columns.map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(caseFileAuthenticationIdsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileAuthenticationIdsCsv.${x.dataField}` }))),
    ...(caseFileTagsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileTagsCsv.${x.dataField}` }))),
  ],
};

export const householdMembersAddressHistoryDs : IDatasourceSettings = {
  url: 'common/data-providers/household-members-address-history',
  reportingTopic: ReportingTopic.HouseholdMembersAddressHistory,
  key: { caseFileId: 'Guid', memberId: 'Guid', address_from: 'String' },
  columns: [
    ...(caseFileViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(householdViewDs.columns.map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(personAddressHistoryViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(caseFileAuthenticationIdsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileAuthenticationIdsCsv.${x.dataField}` }))),
    ...(caseFileTagsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileTagsCsv.${x.dataField}` }))),
  ],
};

export const referralsDs : IDatasourceSettings = {
  url: 'common/data-providers/referrals',
  reportingTopic: ReportingTopic.Referrals,
  key: { referralId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(householdViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'primaryBeneficiaryFirstName' && c.dataField !== 'primaryBeneficiaryLastName')
            .map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(referralViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `referral.${x.dataField}` }))),
  ],
};

export const householdActivitiesDs : IDatasourceSettings = {
  url: 'common/data-providers/household-activities',
  reportingTopic: ReportingTopic.HouseholdActivities,
  key: { activityId: 'Guid', caseFileId: 'Guid' },
  columns: [
    ...(householdActivitiesViewDS.columns.map((x) => ({ ...x, dataField: `activity.${x.dataField}` }))),
    ...(caseFileViewDs.columns.filter((c) => ['id', 'caseFileNumber', 'eventId', 'householdId', 'eventNameEn', 'eventNameFr'].indexOf(c.dataField) === -1)
            .map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
  ],
};

export const caseFileActivitiesDs : IDatasourceSettings = {
  url: 'common/data-providers/case-file-activities',
  reportingTopic: ReportingTopic.CaseFileActivities,
  key: { activityId: 'Guid' },
  columns: [
    ...(caseFileActivitiesViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `activity.${x.dataField}` }))),
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `primaryMember.${x.dataField}` }))),
    ...(caseFileAuthenticationIdsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileAuthenticationIdsCsv.${x.dataField}` }))),
    ...(caseFileTagsCsvViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileTagsCsv.${x.dataField}` }))),
  ],
};

export const latestCaseFileActivitiesDs : IDatasourceSettings = {
  url: 'common/data-providers/case-file-latest-activity',
  reportingTopic: ReportingTopic.LatestCaseFileActivities,
  key: { caseFileId: 'Guid' },
  columns: [
    ...(latestCaseFileActivitiesViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `latestActivity.${x.dataField}` }))),
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'id' && c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `primaryMember.${x.dataField}` }))),
  ],
};

export const financialAssistancePaymentLineDs : IDatasourceSettings = {
  url: 'common/data-providers/financial-assistance-payment-line',
  reportingTopic: ReportingTopic.PaymentLine,
  key: { paymentLineId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(financialAssistancePaymentLineViewDs.columns.filter((c) => c.dataField !== 'financialAssistancePaymentId' && c.dataField !== 'financialAssistancePaymentGroupId')
          .map((x) => ({ ...x, dataField: `paymentLine.${x.dataField}` }))),
    ...(financialAssistancePaymentViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `payment.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(financialAssistancePaymentGroupViewDs.columns.filter((c) => c.dataField !== 'financialAssistancePaymentId')
          .map((x) => ({ ...x, dataField: `paymentGroup.${x.dataField}` }))),
  ],
};

export const potentialDuplicateDs : IDatasourceSettings = {
  url: 'common/data-providers/potential-duplicates',
  reportingTopic: ReportingTopic.PotentialDuplicates,
  key: { duplicateId: 'Guid', eventId: 'Guid', caseFileNumber: 'String', duplicateCaseFileNumber: 'String' },
  columns: [
    ...(potentialDuplicateViewDs.columns.map((x) => ({ ...x, dataField: `potentialDuplicate.${x.dataField}` }))),
  ],
};

export const usersInTeamsDs : IDatasourceSettings = {
  url: 'common/data-providers/users-in-teams',
  reportingTopic: ReportingTopic.UsersInTeams,
  key: { userId: 'Guid', teamId: 'Guid' },
  columns: [
    ...(userAccountViewDS.columns.map((x) => ({ ...x, dataField: `userAccount.${x.dataField}` }))),
    ...(teamDetailViewDS.columns.filter((c) => c.dataField !== 'primaryContactId').map((x) => ({ ...x, dataField: `teamDetail.${x.dataField}` }))),
  ],
};

export const financialAssistancePaymentGroupDs : IDatasourceSettings = {
  url: 'common/data-providers/financial-assistance-payment-group',
  reportingTopic: ReportingTopic.PaymentGroup,
  key: { paymentGroupId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(financialAssistancePaymentViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `payment.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(financialAssistancePaymentGroupViewDs.columns.filter((c) => c.dataField !== 'financialAssistancePaymentId')
          .map((x) => ({ ...x, dataField: `paymentGroup.${x.dataField}` }))),
    ...(financialAssistanceSummaryByPaymentGroupViewDS.columns.filter((c) => c.dataField !== 'financialAssistancePaymentGroupId')
          .map((x) => ({ ...x, dataField: `groupSummary.${x.dataField}` }))),
    ...(financialAssistancePaymentSummaryViewDS.columns.filter((c) => c.dataField !== 'caseFileId')
              .map((x) => ({ ...x, dataField: `financialAssistancePaymentSummary.${x.dataField}` }))),
    ...(householdViewDs.columns.filter((c) => c.dataField !== 'primaryBeneficiary' && c.dataField !== 'primaryBeneficiaryFirstName' && c.dataField !== 'primaryBeneficiaryLastName')
          .map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(caseFileLifetimeActivitiesViewDS.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `caseFileLifetimeActivities.${x.dataField}` }))),
    ...(eTransferPaymentConfirmationViewDS.columns.filter((c) => c.dataField !== 'financialAssistancePaymentId' && c.dataField !== 'financialAssistancePaymentGroupId')
      .map((x) => ({ ...x, dataField: `eTransferPaymentConfirmation.${x.dataField}` }))),
  ],
};

export const caseNotesDs : IDatasourceSettings = {
  url: 'common/data-providers/case-notes',
  reportingTopic: ReportingTopic.CaseNotes,
  key: { casenoteId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(householdViewDs.columns
      .filter((c) => c.dataField !== 'id' && c.dataField !== 'primaryBeneficiary' && c.dataField !== 'primaryBeneficiaryFirstName' && c.dataField !== 'primaryBeneficiaryLastName')
      .map((x) => ({ ...x, dataField: `household.${x.dataField}` }))),
    ...(personViewDs.columns.filter((c) => c.dataField !== 'householdId').map((x) => ({ ...x, dataField: `person.${x.dataField}` }))),
    ...(caseNoteViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `casenote.${x.dataField}` }))),
  ],
};

export const documentsDs : IDatasourceSettings = {
  url: 'common/data-providers/documents',
  reportingTopic: ReportingTopic.Documents,
  key: { documentId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(documentViewDs.columns.filter((c) => c.dataField !== 'caseFileId').map((x) => ({ ...x, dataField: `document.${x.dataField}` }))),
  ],
};

export const caseFileAuthenticationIdsDs : IDatasourceSettings = {
  url: 'common/data-providers/case-file-authentication-ids',
  reportingTopic: ReportingTopic.CaseFileAuthenticationIds,
  key: { caseFileId: 'Guid', authenticationIdId: 'Guid' },
  columns: [
    ...(caseFileViewDs.columns.map((x) => ({ ...x, dataField: `casefile.${x.dataField}` }))),
    ...(caseFileAuthenticationIdViewDS.columns.filter((c) => c.dataField !== 'caseFileId' && c.dataField !== 'authenticationIdId')
      .map((x) => ({ ...x, dataField: `authenticationId.${x.dataField}` }))),
  ],
};

export const datasources = [
  householdMembersDs,
  householdMembersAddressHistoryDs,
  caseFileHouseholdPrimaryDs,
  caseFileActivitiesDs,
  financialAssistancePaymentLineDs,
  referralsDs,
  financialAssistancePaymentGroupDs,
  usersInTeamsDs,
  householdActivitiesDs,
  latestCaseFileActivitiesDs,
  caseNotesDs,
  caseFileAuthenticationIdsDs,
  potentialDuplicateDs,
  teamTaskDs,
  teamTaskHistoryDs,
  documentsDs,
];
