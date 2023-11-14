/* eslint-disable */
import {
  QueryType, ReportingTopic, IQuery,
} from '@libs/entities-lib/reporting';

export const DataCorrectionLabelL6En = {
  id: 'DataCorrectionLabelL6',
  queryType: QueryType.StandardL6en,
  topic: ReportingTopic.HouseholdPrimary,
  state: "{\"columns\":[{\"visibleIndex\":0,\"dataField\":\"casefile.identityAuthenticationMethodEn\",\"name\":\"casefile.identityAuthenticationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":1,\"dataField\":\"casefile.identityAuthenticationMethodFr\",\"name\":\"casefile.identityAuthenticationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":2,\"dataField\":\"casefile.identityAuthenticationStatusEn\",\"name\":\"casefile.identityAuthenticationStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":3,\"dataField\":\"casefile.identityAuthenticationStatusFr\",\"name\":\"casefile.identityAuthenticationStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":4,\"dataField\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameEn\",\"name\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":5,\"dataField\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameFr\",\"name\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":6,\"dataField\":\"casefile.privacyDateTimeConsent\",\"name\":\"casefile.privacyDateTimeConsent\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":7,\"dataField\":\"casefile.consentCrcUserName\",\"name\":\"casefile.consentCrcUserName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":8,\"dataField\":\"casefile.createdBy\",\"name\":\"casefile.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":9,\"dataField\":\"casefile.createDate\",\"name\":\"casefile.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":10,\"dataField\":\"casefile.updateDate\",\"name\":\"casefile.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":11,\"dataField\":\"casefile.isDuplicate\",\"name\":\"casefile.isDuplicate\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":113,\"dataField\":\"casefile.id\",\"name\":\"casefile.id\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":12,\"dataField\":\"casefile.impactValidationMethodEn\",\"name\":\"casefile.impactValidationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":13,\"dataField\":\"casefile.impactValidationMethodFr\",\"name\":\"casefile.impactValidationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":14,\"dataField\":\"casefile.impactStatusValidationStatusEn\",\"name\":\"casefile.impactStatusValidationStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":15,\"dataField\":\"casefile.impactStatusValidationStatusFr\",\"name\":\"casefile.impactStatusValidationStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":16,\"dataField\":\"casefile.householdImpactedCount\",\"name\":\"casefile.householdImpactedCount\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":17,\"dataField\":\"casefile.householdCount\",\"name\":\"casefile.householdCount\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":114,\"dataField\":\"casefile.caseLabel1\",\"name\":\"casefile.caseLabel1\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":115,\"dataField\":\"casefile.caseLabel2\",\"name\":\"casefile.caseLabel2\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":116,\"dataField\":\"casefile.caseLabel3\",\"name\":\"casefile.caseLabel3\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":117,\"dataField\":\"casefile.caseLabel4\",\"name\":\"casefile.caseLabel4\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":18,\"dataField\":\"casefile.caseFileNumber\",\"name\":\"casefile.caseFileNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":19,\"dataField\":\"casefile.registrationLocationEn\",\"name\":\"casefile.registrationLocationEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":20,\"dataField\":\"casefile.registrationLocationFr\",\"name\":\"casefile.registrationLocationFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":21,\"dataField\":\"casefile.registrationMethodEn\",\"name\":\"casefile.registrationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":22,\"dataField\":\"casefile.registrationMethodFr\",\"name\":\"casefile.registrationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":23,\"dataField\":\"casefile.registrationTypeEn\",\"name\":\"casefile.registrationTypeEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":24,\"dataField\":\"casefile.registrationTypeFr\",\"name\":\"casefile.registrationTypeFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":25,\"dataField\":\"casefile.caseFileStatusEn\",\"name\":\"casefile.caseFileStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":26,\"dataField\":\"casefile.caseFileStatusFr\",\"name\":\"casefile.caseFileStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":27,\"dataField\":\"caseFileTagsCsv.csvTagNameEn\",\"name\":\"caseFileTagsCsv.csvTagNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":28,\"dataField\":\"caseFileTagsCsv.csvTagNameFr\",\"name\":\"caseFileTagsCsv.csvTagNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":29,\"dataField\":\"casefile.triageEn\",\"name\":\"casefile.triageEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":30,\"dataField\":\"casefile.triageFr\",\"name\":\"casefile.triageFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":31,\"dataField\":\"casefile.lastUpdatedBy\",\"name\":\"casefile.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":118,\"dataField\":\"casefile.eTag\",\"name\":\"casefile.eTag\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":32,\"dataField\":\"casefile.eventNameEn\",\"name\":\"casefile.eventNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":33,\"dataField\":\"casefile.eventNameFr\",\"name\":\"casefile.eventNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":34,\"dataField\":\"casefile.eventStatusEn\",\"name\":\"casefile.eventStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":35,\"dataField\":\"casefile.eventStatusFr\",\"name\":\"casefile.eventStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":36,\"dataField\":\"household.address_City\",\"name\":\"household.address_City\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":37,\"dataField\":\"household.address_Country\",\"name\":\"household.address_Country\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":38,\"dataField\":\"household.address_From\",\"name\":\"household.address_From\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":39,\"dataField\":\"household.address_Latitude\",\"name\":\"household.address_Latitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":40,\"dataField\":\"household.address_Longitude\",\"name\":\"household.address_Longitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":41,\"dataField\":\"household.address_Observation\",\"name\":\"household.address_Observation\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":42,\"dataField\":\"household.address_PostalCode\",\"name\":\"household.address_PostalCode\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":43,\"dataField\":\"household.address_ProvinceNameEn\",\"name\":\"household.address_ProvinceNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":44,\"dataField\":\"household.address_ProvinceNameFr\",\"name\":\"household.address_ProvinceNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":45,\"dataField\":\"household.address_SpecifiedOtherProvince\",\"name\":\"household.address_SpecifiedOtherProvince\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":46,\"dataField\":\"household.address_StreetAddress\",\"name\":\"household.address_StreetAddress\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":47,\"dataField\":\"household.address_To\",\"name\":\"household.address_To\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":48,\"dataField\":\"household.address_UnitSuite\",\"name\":\"household.address_UnitSuite\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":49,\"dataField\":\"household.createdBy\",\"name\":\"household.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":50,\"dataField\":\"household.createDate\",\"name\":\"household.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":51,\"dataField\":\"household.updateDate\",\"name\":\"household.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":52,\"dataField\":\"casefile.householdId\",\"name\":\"casefile.householdId\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":53,\"dataField\":\"household.registrationNumber\",\"name\":\"household.registrationNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":54,\"dataField\":\"household.householdStatusNameEn\",\"name\":\"household.householdStatusNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":55,\"dataField\":\"household.householdStatusNameFr\",\"name\":\"household.householdStatusNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":56,\"dataField\":\"household.lastUpdatedBy\",\"name\":\"household.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":57,\"dataField\":\"household.eTag\",\"name\":\"household.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":58,\"dataField\":\"financialAssistancePaymentSummary.totalAmountCommitted\",\"name\":\"financialAssistancePaymentSummary.totalAmountCommitted\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":59,\"dataField\":\"financialAssistancePaymentSummary.totalAmountCompleted\",\"name\":\"financialAssistancePaymentSummary.totalAmountCompleted\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":60,\"dataField\":\"financialAssistancePaymentSummary.grandTotal\",\"name\":\"financialAssistancePaymentSummary.grandTotal\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":61,\"dataField\":\"financialAssistancePaymentSummary.totalAmountUnapproved\",\"name\":\"financialAssistancePaymentSummary.totalAmountUnapproved\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":62,\"dataField\":\"primaryMember.address_CheckIn\",\"name\":\"primaryMember.address_CheckIn\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":63,\"dataField\":\"primaryMember.address_CrcProvided\",\"name\":\"primaryMember.address_CrcProvided\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":64,\"dataField\":\"primaryMember.address_CheckOut\",\"name\":\"primaryMember.address_CheckOut\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":65,\"dataField\":\"primaryMember.address_City\",\"name\":\"primaryMember.address_City\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":66,\"dataField\":\"primaryMember.address_Country\",\"name\":\"primaryMember.address_Country\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":67,\"dataField\":\"primaryMember.address_EventId\",\"name\":\"primaryMember.address_EventId\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":68,\"dataField\":\"primaryMember.address_From\",\"name\":\"primaryMember.address_From\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":69,\"dataField\":\"primaryMember.address_Latitude\",\"name\":\"primaryMember.address_Latitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":70,\"dataField\":\"primaryMember.address_Longitude\",\"name\":\"primaryMember.address_Longitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":71,\"dataField\":\"primaryMember.address_PlaceName\",\"name\":\"primaryMember.address_PlaceName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":72,\"dataField\":\"primaryMember.address_PlaceNumber\",\"name\":\"primaryMember.address_PlaceNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":73,\"dataField\":\"primaryMember.address_PostalCode\",\"name\":\"primaryMember.address_PostalCode\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":74,\"dataField\":\"primaryMember.address_ProvinceNameEn\",\"name\":\"primaryMember.address_ProvinceNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":75,\"dataField\":\"primaryMember.address_ProvinceNameFr\",\"name\":\"primaryMember.address_ProvinceNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":76,\"dataField\":\"primaryMember.address_SpecifiedOtherProvince\",\"name\":\"primaryMember.address_SpecifiedOtherProvince\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":77,\"dataField\":\"primaryMember.shelterLocationsNameEn\",\"name\":\"primaryMember.shelterLocationsNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":78,\"dataField\":\"primaryMember.shelterLocationsNameFr\",\"name\":\"primaryMember.shelterLocationsNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":79,\"dataField\":\"primaryMember.address_StreetAddress\",\"name\":\"primaryMember.address_StreetAddress\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":80,\"dataField\":\"primaryMember.address_To\",\"name\":\"primaryMember.address_To\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":81,\"dataField\":\"primaryMember.address_AddressTypeNameEn\",\"name\":\"primaryMember.address_AddressTypeNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":82,\"dataField\":\"primaryMember.address_AddressTypeNameFr\",\"name\":\"primaryMember.address_AddressTypeNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":83,\"dataField\":\"primaryMember.address_UnitSuite\",\"name\":\"primaryMember.address_UnitSuite\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":84,\"dataField\":\"primaryMember.age\",\"name\":\"primaryMember.age\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":85,\"dataField\":\"primaryMember.alternatePhoneNumberExtension\",\"name\":\"primaryMember.alternatePhoneNumberExtension\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":86,\"dataField\":\"primaryMember.alternatePhoneNumber\",\"name\":\"primaryMember.alternatePhoneNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":87,\"dataField\":\"primaryMember.indigenousCommunityNameEn\",\"name\":\"primaryMember.indigenousCommunityNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":88,\"dataField\":\"primaryMember.indigenousCommunityNameFr\",\"name\":\"primaryMember.indigenousCommunityNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":89,\"dataField\":\"primaryMember.indigenousCommunity_SpecifiedOther\",\"name\":\"primaryMember.indigenousCommunity_SpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":90,\"dataField\":\"primaryMember.createdBy\",\"name\":\"primaryMember.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":91,\"dataField\":\"primaryMember.createDate\",\"name\":\"primaryMember.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":92,\"dataField\":\"primaryMember.dateOfBirth\",\"name\":\"primaryMember.dateOfBirth\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":93,\"dataField\":\"primaryMember.updateDate\",\"name\":\"primaryMember.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":94,\"dataField\":\"primaryMember.email\",\"name\":\"primaryMember.email\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":95,\"dataField\":\"primaryMember.firstName\",\"name\":\"primaryMember.firstName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":96,\"dataField\":\"primaryMember.genderNameEn\",\"name\":\"primaryMember.genderNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":97,\"dataField\":\"primaryMember.genderNameFr\",\"name\":\"primaryMember.genderNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":98,\"dataField\":\"primaryMember.gender_SpecifiedOther\",\"name\":\"primaryMember.gender_SpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":99,\"dataField\":\"primaryMember.homePhoneNumber\",\"name\":\"primaryMember.homePhoneNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":100,\"dataField\":\"primaryMember.lastName\",\"name\":\"primaryMember.lastName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":101,\"dataField\":\"primaryMember.middleName\",\"name\":\"primaryMember.middleName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":102,\"dataField\":\"primaryMember.mobilePhoneNumber\",\"name\":\"primaryMember.mobilePhoneNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":103,\"dataField\":\"primaryMember.primarySpokenLanguageOther\",\"name\":\"primaryMember.primarySpokenLanguageOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":104,\"dataField\":\"primaryMember.preferredLanguageNameEn\",\"name\":\"primaryMember.preferredLanguageNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":105,\"dataField\":\"primaryMember.preferredLanguageNameFr\",\"name\":\"primaryMember.preferredLanguageNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":106,\"dataField\":\"primaryMember.preferredName\",\"name\":\"primaryMember.preferredName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":107,\"dataField\":\"primaryMember.primarySpokenLanguageNameEn\",\"name\":\"primaryMember.primarySpokenLanguageNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":108,\"dataField\":\"primaryMember.primarySpokenLanguageNameFr\",\"name\":\"primaryMember.primarySpokenLanguageNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":109,\"dataField\":\"primaryMember.isPrimary\",\"name\":\"primaryMember.isPrimary\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":110,\"dataField\":\"primaryMember.lastUpdatedBy\",\"name\":\"primaryMember.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":111,\"dataField\":\"primaryMember.eTag\",\"name\":\"primaryMember.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":112,\"dataField\":\"household.primaryBeneficiary\",\"name\":\"household.primaryBeneficiary\",\"dataType\":\"string\",\"visible\":false}],\"allowedPageSizes\":[10,20,40],\"filterPanel\":{\"filterEnabled\":true},\"filterValue\":null,\"searchText\":\"\",\"pageIndex\":0,\"pageSize\":20}",
  name: 'Data Correction - Labels',
} as IQuery;

export const DataCorrectionLabelL6Fr = {
  id: 'DataCorrectionLabelL6',
  queryType: QueryType.StandardL6fr,
  topic: ReportingTopic.HouseholdPrimary,
  state: DataCorrectionLabelL6En.state,
  name: 'Correction de données - Étiquettes',
} as IQuery;
