/* eslint-disable */
import {
  QueryType, ReportingTopic, IQuery,
} from '@libs/entities-lib/reporting';


export const RegistrationByBeneficiaryL6En = {
  id: 'RegistrationByBeneficiaryL6',
  queryType: QueryType.StandardL6en,
  topic: ReportingTopic.HouseholdMembers,
  state: "{\"columns\":[{\"visibleIndex\":126,\"dataField\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameEn\",\"name\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameEn\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":127,\"dataField\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameFr\",\"name\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameFr\",\"dataType\":\"string\",\"visible\":false,\"filterType\":\"include\"},{\"visibleIndex\":124,\"dataField\":\"caseFileTagsCsv.csvTagNameEn\",\"name\":\"caseFileTagsCsv.csvTagNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":125,\"dataField\":\"caseFileTagsCsv.csvTagNameFr\",\"name\":\"caseFileTagsCsv.csvTagNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":5,\"dataField\":\"casefile.caseFileNumber\",\"name\":\"casefile.caseFileNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":3,\"dataField\":\"casefile.caseFileStatusEn\",\"name\":\"casefile.caseFileStatusEn\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":4,\"dataField\":\"casefile.caseFileStatusFr\",\"name\":\"casefile.caseFileStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":110,\"dataField\":\"casefile.caseLabel1\",\"name\":\"casefile.caseLabel1\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":111,\"dataField\":\"casefile.caseLabel2\",\"name\":\"casefile.caseLabel2\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":112,\"dataField\":\"casefile.caseLabel3\",\"name\":\"casefile.caseLabel3\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":113,\"dataField\":\"casefile.caseLabel4\",\"name\":\"casefile.caseLabel4\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":37,\"dataField\":\"casefile.consentCrcUserName\",\"name\":\"casefile.consentCrcUserName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":2,\"dataField\":\"casefile.createDate\",\"name\":\"casefile.createDate\",\"dataType\":\"datetime\",\"visible\":true},{\"visibleIndex\":40,\"dataField\":\"casefile.createdBy\",\"name\":\"casefile.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":42,\"dataField\":\"casefile.eTag\",\"name\":\"casefile.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":1,\"dataField\":\"casefile.eventNameEn\",\"name\":\"casefile.eventNameEn\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":108,\"dataField\":\"casefile.eventNameFr\",\"name\":\"casefile.eventNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":8,\"dataField\":\"casefile.eventStatusEn\",\"name\":\"casefile.eventStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":9,\"dataField\":\"casefile.eventStatusFr\",\"name\":\"casefile.eventStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":10,\"dataField\":\"casefile.exceptionalAuthenticationTypeNameEn\",\"name\":\"casefile.exceptionalAuthenticationTypeNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":11,\"dataField\":\"casefile.exceptionalAuthenticationTypeNameFr\",\"name\":\"casefile.exceptionalAuthenticationTypeNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":14,\"dataField\":\"casefile.exceptionalAuthenticationTypeSpecifiedOther\",\"name\":\"casefile.exceptionalAuthenticationTypeSpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":36,\"dataField\":\"casefile.householdCount\",\"name\":\"casefile.householdCount\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":35,\"dataField\":\"casefile.householdImpactedCount\",\"name\":\"casefile.householdImpactedCount\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":0,\"dataField\":\"casefile.id\",\"name\":\"casefile.id\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":19,\"dataField\":\"casefile.identityAuthenticationMethodEn\",\"name\":\"casefile.identityAuthenticationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":20,\"dataField\":\"casefile.identityAuthenticationMethodFr\",\"name\":\"casefile.identityAuthenticationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":22,\"dataField\":\"casefile.identityAuthenticationStatusEn\",\"name\":\"casefile.identityAuthenticationStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":23,\"dataField\":\"casefile.identityAuthenticationStatusFr\",\"name\":\"casefile.identityAuthenticationStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":28,\"dataField\":\"casefile.impactStatusValidationStatusEn\",\"name\":\"casefile.impactStatusValidationStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":29,\"dataField\":\"casefile.impactStatusValidationStatusFr\",\"name\":\"casefile.impactStatusValidationStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":25,\"dataField\":\"casefile.impactValidationMethodEn\",\"name\":\"casefile.impactValidationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":26,\"dataField\":\"casefile.impactValidationMethodFr\",\"name\":\"casefile.impactValidationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":41,\"dataField\":\"casefile.lastUpdatedBy\",\"name\":\"casefile.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":38,\"dataField\":\"casefile.privacyDateTimeConsent\",\"name\":\"casefile.privacyDateTimeConsent\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":7,\"dataField\":\"casefile.recoveryPlan_CrcProvided\",\"name\":\"casefile.recoveryPlan_CrcProvided\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":17,\"dataField\":\"casefile.recoveryPlan_HasRecoveryPlan\",\"name\":\"casefile.recoveryPlan_HasRecoveryPlan\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":18,\"dataField\":\"casefile.recoveryPlan_StartDate\",\"name\":\"casefile.recoveryPlan_StartDate\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":33,\"dataField\":\"casefile.registrationLocationEn\",\"name\":\"casefile.registrationLocationEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":34,\"dataField\":\"casefile.registrationLocationFr\",\"name\":\"casefile.registrationLocationFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":31,\"dataField\":\"casefile.registrationMethodEn\",\"name\":\"casefile.registrationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":32,\"dataField\":\"casefile.registrationMethodFr\",\"name\":\"casefile.registrationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":15,\"dataField\":\"casefile.registrationTypeEn\",\"name\":\"casefile.registrationTypeEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":16,\"dataField\":\"casefile.registrationTypeFr\",\"name\":\"casefile.registrationTypeFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":21,\"dataField\":\"casefile.tier2StateEn\",\"name\":\"casefile.tier2StateEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":24,\"dataField\":\"casefile.tier2StateFr\",\"name\":\"casefile.tier2StateFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":12,\"dataField\":\"casefile.triageEn\",\"name\":\"casefile.triageEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":13,\"dataField\":\"casefile.triageFr\",\"name\":\"casefile.triageFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":39,\"dataField\":\"casefile.updateDate\",\"name\":\"casefile.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":89,\"dataField\":\"household.address_City\",\"name\":\"household.address_City\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":51,\"dataField\":\"household.address_Country\",\"name\":\"household.address_Country\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":49,\"dataField\":\"household.address_From\",\"name\":\"household.address_From\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":53,\"dataField\":\"household.address_Latitude\",\"name\":\"household.address_Latitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":54,\"dataField\":\"household.address_Longitude\",\"name\":\"household.address_Longitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":48,\"dataField\":\"household.address_Observation\",\"name\":\"household.address_Observation\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":93,\"dataField\":\"household.address_PostalCode\",\"name\":\"household.address_PostalCode\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":91,\"dataField\":\"household.address_ProvinceNameEn\",\"name\":\"household.address_ProvinceNameEn\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":92,\"dataField\":\"household.address_ProvinceNameFr\",\"name\":\"household.address_ProvinceNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":52,\"dataField\":\"household.address_SpecifiedOtherProvince\",\"name\":\"household.address_SpecifiedOtherProvince\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":87,\"dataField\":\"household.address_StreetAddress\",\"name\":\"household.address_StreetAddress\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":50,\"dataField\":\"household.address_To\",\"name\":\"household.address_To\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":88,\"dataField\":\"household.address_UnitSuite\",\"name\":\"household.address_UnitSuite\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":57,\"dataField\":\"household.createDate\",\"name\":\"household.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":59,\"dataField\":\"household.createdBy\",\"name\":\"household.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":61,\"dataField\":\"household.eTag\",\"name\":\"household.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":55,\"dataField\":\"household.householdStatusNameEn\",\"name\":\"household.householdStatusNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":56,\"dataField\":\"household.householdStatusNameFr\",\"name\":\"household.householdStatusNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":6,\"dataField\":\"household.id\",\"name\":\"household.id\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":60,\"dataField\":\"household.lastUpdatedBy\",\"name\":\"household.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":43,\"dataField\":\"household.primaryBeneficiary\",\"name\":\"household.primaryBeneficiary\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":45,\"dataField\":\"household.primaryBeneficiaryFirstName\",\"name\":\"household.primaryBeneficiaryFirstName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":46,\"dataField\":\"household.primaryBeneficiaryLastName\",\"name\":\"household.primaryBeneficiaryLastName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":47,\"dataField\":\"household.registrationNumber\",\"name\":\"household.registrationNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":58,\"dataField\":\"household.updateDate\",\"name\":\"household.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":95,\"dataField\":\"person.address_AddressTypeNameEn\",\"name\":\"person.address_AddressTypeNameEn\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":96,\"dataField\":\"person.address_AddressTypeNameFr\",\"name\":\"person.address_AddressTypeNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":120,\"dataField\":\"person.address_CheckIn\",\"name\":\"person.address_CheckIn\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":121,\"dataField\":\"person.address_CheckOut\",\"name\":\"person.address_CheckOut\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":101,\"dataField\":\"person.address_City\",\"name\":\"person.address_City\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":72,\"dataField\":\"person.address_Country\",\"name\":\"person.address_Country\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":122,\"dataField\":\"person.address_CrcProvided\",\"name\":\"person.address_CrcProvided\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":70,\"dataField\":\"person.address_From\",\"name\":\"person.address_From\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":75,\"dataField\":\"person.address_Latitude\",\"name\":\"person.address_Latitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":76,\"dataField\":\"person.address_Longitude\",\"name\":\"person.address_Longitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":97,\"dataField\":\"person.address_PlaceName\",\"name\":\"person.address_PlaceName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":98,\"dataField\":\"person.address_PlaceNumber\",\"name\":\"person.address_PlaceNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":102,\"dataField\":\"person.address_PostalCode\",\"name\":\"person.address_PostalCode\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":73,\"dataField\":\"person.address_ProvinceNameEn\",\"name\":\"person.address_ProvinceNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":90,\"dataField\":\"person.address_ProvinceNameFr\",\"name\":\"person.address_ProvinceNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":74,\"dataField\":\"person.address_SpecifiedOtherProvince\",\"name\":\"person.address_SpecifiedOtherProvince\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":99,\"dataField\":\"person.address_StreetAddress\",\"name\":\"person.address_StreetAddress\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":129,\"dataField\":\"person.address_Takeover\",\"name\":\"person.address_Takeover\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":71,\"dataField\":\"person.address_To\",\"name\":\"person.address_To\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":100,\"dataField\":\"person.address_UnitSuite\",\"name\":\"person.address_UnitSuite\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":84,\"dataField\":\"person.age\",\"name\":\"person.age\",\"dataType\":\"number\",\"visible\":true},{\"visibleIndex\":105,\"dataField\":\"person.alternatePhoneNumber\",\"name\":\"person.alternatePhoneNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":106,\"dataField\":\"person.alternatePhoneNumberExtension\",\"name\":\"person.alternatePhoneNumberExtension\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":123,\"dataField\":\"person.caseFileIndividualETag\",\"name\":\"person.caseFileIndividualETag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":128,\"dataField\":\"person.caseFileIndividualId\",\"name\":\"person.caseFileIndividualId\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":77,\"dataField\":\"person.createDate\",\"name\":\"person.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":79,\"dataField\":\"person.createdBy\",\"name\":\"person.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":83,\"dataField\":\"person.dateOfBirth\",\"name\":\"person.dateOfBirth\",\"dataType\":\"date\",\"visible\":true},{\"visibleIndex\":81,\"dataField\":\"person.eTag\",\"name\":\"person.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":107,\"dataField\":\"person.email\",\"name\":\"person.email\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":62,\"dataField\":\"person.firstName\",\"name\":\"person.firstName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":27,\"dataField\":\"person.fullName\",\"name\":\"person.fullName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":85,\"dataField\":\"person.genderNameEn\",\"name\":\"person.genderNameEn\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":86,\"dataField\":\"person.genderNameFr\",\"name\":\"person.genderNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":65,\"dataField\":\"person.gender_SpecifiedOther\",\"name\":\"person.gender_SpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":104,\"dataField\":\"person.homePhoneNumber\",\"name\":\"person.homePhoneNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":109,\"dataField\":\"person.id\",\"name\":\"person.id\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":66,\"dataField\":\"person.indigenousCommunityNameEn\",\"name\":\"person.indigenousCommunityNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":67,\"dataField\":\"person.indigenousCommunityNameFr\",\"name\":\"person.indigenousCommunityNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":68,\"dataField\":\"person.indigenousCommunity_SpecifiedOther\",\"name\":\"person.indigenousCommunity_SpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":44,\"dataField\":\"person.isPrimary\",\"name\":\"person.isPrimary\",\"dataType\":\"boolean\",\"visible\":true},{\"visibleIndex\":64,\"dataField\":\"person.lastName\",\"name\":\"person.lastName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":80,\"dataField\":\"person.lastUpdatedBy\",\"name\":\"person.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":63,\"dataField\":\"person.middleName\",\"name\":\"person.middleName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":103,\"dataField\":\"person.mobilePhoneNumber\",\"name\":\"person.mobilePhoneNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":69,\"dataField\":\"person.preferredLanguageNameEn\",\"name\":\"person.preferredLanguageNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":114,\"dataField\":\"person.preferredLanguageNameFr\",\"name\":\"person.preferredLanguageNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":82,\"dataField\":\"person.preferredName\",\"name\":\"person.preferredName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":115,\"dataField\":\"person.primarySpokenLanguageNameEn\",\"name\":\"person.primarySpokenLanguageNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":116,\"dataField\":\"person.primarySpokenLanguageNameFr\",\"name\":\"person.primarySpokenLanguageNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":117,\"dataField\":\"person.primarySpokenLanguageOther\",\"name\":\"person.primarySpokenLanguageOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":94,\"dataField\":\"person.receivingAssistance\",\"name\":\"person.receivingAssistance\",\"dataType\":\"boolean\",\"visible\":true},{\"visibleIndex\":30,\"dataField\":\"person.shelterLocationId\",\"name\":\"person.shelterLocationId\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":118,\"dataField\":\"person.shelterLocationsNameEn\",\"name\":\"person.shelterLocationsNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":119,\"dataField\":\"person.shelterLocationsNameFr\",\"name\":\"person.shelterLocationsNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":78,\"dataField\":\"person.updateDate\",\"name\":\"person.updateDate\",\"dataType\":\"datetime\",\"visible\":false}],\"allowedPageSizes\":[10,20,40],\"filterPanel\":{\"filterEnabled\":true},\"filterValue\":null,\"searchText\":\"\",\"pageIndex\":0,\"pageSize\":20,\"selectedRowKeys\":[]}",
  name: 'Registration List - by Household member',
} as IQuery;


export const RegistrationByBeneficiaryL6Fr = {
  id: 'RegistrationByBeneficiaryL6',
  queryType: QueryType.StandardL6fr,
  topic: ReportingTopic.HouseholdMembers,
  state: "{\"columns\":[{\"visibleIndex\":124,\"dataField\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameEn\",\"name\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":127,\"dataField\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameFr\",\"name\":\"caseFileAuthenticationIdsCsv.csvAuthenticationIdNameFr\",\"dataType\":\"string\",\"visible\":true,\"filterType\":\"include\"},{\"visibleIndex\":125,\"dataField\":\"caseFileTagsCsv.csvTagNameEn\",\"name\":\"caseFileTagsCsv.csvTagNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":126,\"dataField\":\"caseFileTagsCsv.csvTagNameFr\",\"name\":\"caseFileTagsCsv.csvTagNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":5,\"dataField\":\"casefile.caseFileNumber\",\"name\":\"casefile.caseFileNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":3,\"dataField\":\"casefile.caseFileStatusEn\",\"name\":\"casefile.caseFileStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":4,\"dataField\":\"casefile.caseFileStatusFr\",\"name\":\"casefile.caseFileStatusFr\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":109,\"dataField\":\"casefile.caseLabel1\",\"name\":\"casefile.caseLabel1\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":110,\"dataField\":\"casefile.caseLabel2\",\"name\":\"casefile.caseLabel2\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":111,\"dataField\":\"casefile.caseLabel3\",\"name\":\"casefile.caseLabel3\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":112,\"dataField\":\"casefile.caseLabel4\",\"name\":\"casefile.caseLabel4\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":37,\"dataField\":\"casefile.consentCrcUserName\",\"name\":\"casefile.consentCrcUserName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":2,\"dataField\":\"casefile.createDate\",\"name\":\"casefile.createDate\",\"dataType\":\"datetime\",\"visible\":true},{\"visibleIndex\":40,\"dataField\":\"casefile.createdBy\",\"name\":\"casefile.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":42,\"dataField\":\"casefile.eTag\",\"name\":\"casefile.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":107,\"dataField\":\"casefile.eventNameEn\",\"name\":\"casefile.eventNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":1,\"dataField\":\"casefile.eventNameFr\",\"name\":\"casefile.eventNameFr\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":8,\"dataField\":\"casefile.eventStatusEn\",\"name\":\"casefile.eventStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":9,\"dataField\":\"casefile.eventStatusFr\",\"name\":\"casefile.eventStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":10,\"dataField\":\"casefile.exceptionalAuthenticationTypeNameEn\",\"name\":\"casefile.exceptionalAuthenticationTypeNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":14,\"dataField\":\"casefile.exceptionalAuthenticationTypeNameFr\",\"name\":\"casefile.exceptionalAuthenticationTypeNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":11,\"dataField\":\"casefile.exceptionalAuthenticationTypeSpecifiedOther\",\"name\":\"casefile.exceptionalAuthenticationTypeSpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":36,\"dataField\":\"casefile.householdCount\",\"name\":\"casefile.householdCount\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":35,\"dataField\":\"casefile.householdImpactedCount\",\"name\":\"casefile.householdImpactedCount\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":0,\"dataField\":\"casefile.id\",\"name\":\"casefile.id\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":19,\"dataField\":\"casefile.identityAuthenticationMethodEn\",\"name\":\"casefile.identityAuthenticationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":20,\"dataField\":\"casefile.identityAuthenticationMethodFr\",\"name\":\"casefile.identityAuthenticationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":22,\"dataField\":\"casefile.identityAuthenticationStatusEn\",\"name\":\"casefile.identityAuthenticationStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":23,\"dataField\":\"casefile.identityAuthenticationStatusFr\",\"name\":\"casefile.identityAuthenticationStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":28,\"dataField\":\"casefile.impactStatusValidationStatusEn\",\"name\":\"casefile.impactStatusValidationStatusEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":29,\"dataField\":\"casefile.impactStatusValidationStatusFr\",\"name\":\"casefile.impactStatusValidationStatusFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":25,\"dataField\":\"casefile.impactValidationMethodEn\",\"name\":\"casefile.impactValidationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":26,\"dataField\":\"casefile.impactValidationMethodFr\",\"name\":\"casefile.impactValidationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":41,\"dataField\":\"casefile.lastUpdatedBy\",\"name\":\"casefile.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":38,\"dataField\":\"casefile.privacyDateTimeConsent\",\"name\":\"casefile.privacyDateTimeConsent\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":17,\"dataField\":\"casefile.recoveryPlan_CrcProvided\",\"name\":\"casefile.recoveryPlan_CrcProvided\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":7,\"dataField\":\"casefile.recoveryPlan_HasRecoveryPlan\",\"name\":\"casefile.recoveryPlan_HasRecoveryPlan\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":18,\"dataField\":\"casefile.recoveryPlan_StartDate\",\"name\":\"casefile.recoveryPlan_StartDate\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":33,\"dataField\":\"casefile.registrationLocationEn\",\"name\":\"casefile.registrationLocationEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":34,\"dataField\":\"casefile.registrationLocationFr\",\"name\":\"casefile.registrationLocationFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":31,\"dataField\":\"casefile.registrationMethodEn\",\"name\":\"casefile.registrationMethodEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":32,\"dataField\":\"casefile.registrationMethodFr\",\"name\":\"casefile.registrationMethodFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":15,\"dataField\":\"casefile.registrationTypeEn\",\"name\":\"casefile.registrationTypeEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":16,\"dataField\":\"casefile.registrationTypeFr\",\"name\":\"casefile.registrationTypeFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":21,\"dataField\":\"casefile.tier2StateEn\",\"name\":\"casefile.tier2StateEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":24,\"dataField\":\"casefile.tier2StateFr\",\"name\":\"casefile.tier2StateFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":12,\"dataField\":\"casefile.triageEn\",\"name\":\"casefile.triageEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":13,\"dataField\":\"casefile.triageFr\",\"name\":\"casefile.triageFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":39,\"dataField\":\"casefile.updateDate\",\"name\":\"casefile.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":89,\"dataField\":\"household.address_City\",\"name\":\"household.address_City\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":51,\"dataField\":\"household.address_Country\",\"name\":\"household.address_Country\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":49,\"dataField\":\"household.address_From\",\"name\":\"household.address_From\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":53,\"dataField\":\"household.address_Latitude\",\"name\":\"household.address_Latitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":54,\"dataField\":\"household.address_Longitude\",\"name\":\"household.address_Longitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":48,\"dataField\":\"household.address_Observation\",\"name\":\"household.address_Observation\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":93,\"dataField\":\"household.address_PostalCode\",\"name\":\"household.address_PostalCode\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":90,\"dataField\":\"household.address_ProvinceNameEn\",\"name\":\"household.address_ProvinceNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":92,\"dataField\":\"household.address_ProvinceNameFr\",\"name\":\"household.address_ProvinceNameFr\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":52,\"dataField\":\"household.address_SpecifiedOtherProvince\",\"name\":\"household.address_SpecifiedOtherProvince\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":87,\"dataField\":\"household.address_StreetAddress\",\"name\":\"household.address_StreetAddress\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":50,\"dataField\":\"household.address_To\",\"name\":\"household.address_To\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":88,\"dataField\":\"household.address_UnitSuite\",\"name\":\"household.address_UnitSuite\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":57,\"dataField\":\"household.createDate\",\"name\":\"household.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":59,\"dataField\":\"household.createdBy\",\"name\":\"household.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":61,\"dataField\":\"household.eTag\",\"name\":\"household.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":55,\"dataField\":\"household.householdStatusNameEn\",\"name\":\"household.householdStatusNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":56,\"dataField\":\"household.householdStatusNameFr\",\"name\":\"household.householdStatusNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":6,\"dataField\":\"household.id\",\"name\":\"household.id\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":60,\"dataField\":\"household.lastUpdatedBy\",\"name\":\"household.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":43,\"dataField\":\"household.primaryBeneficiary\",\"name\":\"household.primaryBeneficiary\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":45,\"dataField\":\"household.primaryBeneficiaryFirstName\",\"name\":\"household.primaryBeneficiaryFirstName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":46,\"dataField\":\"household.primaryBeneficiaryLastName\",\"name\":\"household.primaryBeneficiaryLastName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":47,\"dataField\":\"household.registrationNumber\",\"name\":\"household.registrationNumber\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":58,\"dataField\":\"household.updateDate\",\"name\":\"household.updateDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":117,\"dataField\":\"person.address_AddressTypeNameEn\",\"name\":\"person.address_AddressTypeNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":95,\"dataField\":\"person.address_AddressTypeNameFr\",\"name\":\"person.address_AddressTypeNameFr\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":120,\"dataField\":\"person.address_CheckIn\",\"name\":\"person.address_CheckIn\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":121,\"dataField\":\"person.address_CheckOut\",\"name\":\"person.address_CheckOut\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":100,\"dataField\":\"person.address_City\",\"name\":\"person.address_City\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":72,\"dataField\":\"person.address_Country\",\"name\":\"person.address_Country\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":122,\"dataField\":\"person.address_CrcProvided\",\"name\":\"person.address_CrcProvided\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":70,\"dataField\":\"person.address_From\",\"name\":\"person.address_From\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":75,\"dataField\":\"person.address_Latitude\",\"name\":\"person.address_Latitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":76,\"dataField\":\"person.address_Longitude\",\"name\":\"person.address_Longitude\",\"dataType\":\"number\",\"visible\":false},{\"visibleIndex\":96,\"dataField\":\"person.address_PlaceName\",\"name\":\"person.address_PlaceName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":97,\"dataField\":\"person.address_PlaceNumber\",\"name\":\"person.address_PlaceNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":101,\"dataField\":\"person.address_PostalCode\",\"name\":\"person.address_PostalCode\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":73,\"dataField\":\"person.address_ProvinceNameEn\",\"name\":\"person.address_ProvinceNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":91,\"dataField\":\"person.address_ProvinceNameFr\",\"name\":\"person.address_ProvinceNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":74,\"dataField\":\"person.address_SpecifiedOtherProvince\",\"name\":\"person.address_SpecifiedOtherProvince\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":98,\"dataField\":\"person.address_StreetAddress\",\"name\":\"person.address_StreetAddress\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":129,\"dataField\":\"person.address_Takeover\",\"name\":\"person.address_Takeover\",\"dataType\":\"boolean\",\"visible\":false},{\"visibleIndex\":71,\"dataField\":\"person.address_To\",\"name\":\"person.address_To\",\"dataType\":\"date\",\"visible\":false},{\"visibleIndex\":99,\"dataField\":\"person.address_UnitSuite\",\"name\":\"person.address_UnitSuite\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":84,\"dataField\":\"person.age\",\"name\":\"person.age\",\"dataType\":\"number\",\"visible\":true},{\"visibleIndex\":104,\"dataField\":\"person.alternatePhoneNumber\",\"name\":\"person.alternatePhoneNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":105,\"dataField\":\"person.alternatePhoneNumberExtension\",\"name\":\"person.alternatePhoneNumberExtension\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":123,\"dataField\":\"person.caseFileIndividualETag\",\"name\":\"person.caseFileIndividualETag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":128,\"dataField\":\"person.caseFileIndividualId\",\"name\":\"person.caseFileIndividualId\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":77,\"dataField\":\"person.createDate\",\"name\":\"person.createDate\",\"dataType\":\"datetime\",\"visible\":false},{\"visibleIndex\":79,\"dataField\":\"person.createdBy\",\"name\":\"person.createdBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":83,\"dataField\":\"person.dateOfBirth\",\"name\":\"person.dateOfBirth\",\"dataType\":\"date\",\"visible\":true},{\"visibleIndex\":81,\"dataField\":\"person.eTag\",\"name\":\"person.eTag\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":106,\"dataField\":\"person.email\",\"name\":\"person.email\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":62,\"dataField\":\"person.firstName\",\"name\":\"person.firstName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":30,\"dataField\":\"person.fullName\",\"name\":\"person.fullName\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":85,\"dataField\":\"person.genderNameEn\",\"name\":\"person.genderNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":86,\"dataField\":\"person.genderNameFr\",\"name\":\"person.genderNameFr\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":65,\"dataField\":\"person.gender_SpecifiedOther\",\"name\":\"person.gender_SpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":103,\"dataField\":\"person.homePhoneNumber\",\"name\":\"person.homePhoneNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":108,\"dataField\":\"person.id\",\"name\":\"person.id\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":66,\"dataField\":\"person.indigenousCommunityNameEn\",\"name\":\"person.indigenousCommunityNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":67,\"dataField\":\"person.indigenousCommunityNameFr\",\"name\":\"person.indigenousCommunityNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":68,\"dataField\":\"person.indigenousCommunity_SpecifiedOther\",\"name\":\"person.indigenousCommunity_SpecifiedOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":44,\"dataField\":\"person.isPrimary\",\"name\":\"person.isPrimary\",\"dataType\":\"boolean\",\"visible\":true},{\"visibleIndex\":64,\"dataField\":\"person.lastName\",\"name\":\"person.lastName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":80,\"dataField\":\"person.lastUpdatedBy\",\"name\":\"person.lastUpdatedBy\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":63,\"dataField\":\"person.middleName\",\"name\":\"person.middleName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":102,\"dataField\":\"person.mobilePhoneNumber\",\"name\":\"person.mobilePhoneNumber\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":69,\"dataField\":\"person.preferredLanguageNameEn\",\"name\":\"person.preferredLanguageNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":113,\"dataField\":\"person.preferredLanguageNameFr\",\"name\":\"person.preferredLanguageNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":82,\"dataField\":\"person.preferredName\",\"name\":\"person.preferredName\",\"dataType\":\"string\",\"visible\":true},{\"visibleIndex\":114,\"dataField\":\"person.primarySpokenLanguageNameEn\",\"name\":\"person.primarySpokenLanguageNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":115,\"dataField\":\"person.primarySpokenLanguageNameFr\",\"name\":\"person.primarySpokenLanguageNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":116,\"dataField\":\"person.primarySpokenLanguageOther\",\"name\":\"person.primarySpokenLanguageOther\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":94,\"dataField\":\"person.receivingAssistance\",\"name\":\"person.receivingAssistance\",\"dataType\":\"boolean\",\"visible\":true},{\"visibleIndex\":27,\"dataField\":\"person.shelterLocationId\",\"name\":\"person.shelterLocationId\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":118,\"dataField\":\"person.shelterLocationsNameEn\",\"name\":\"person.shelterLocationsNameEn\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":119,\"dataField\":\"person.shelterLocationsNameFr\",\"name\":\"person.shelterLocationsNameFr\",\"dataType\":\"string\",\"visible\":false},{\"visibleIndex\":78,\"dataField\":\"person.updateDate\",\"name\":\"person.updateDate\",\"dataType\":\"datetime\",\"visible\":false}],\"allowedPageSizes\":[10,20,40],\"filterPanel\":{\"filterEnabled\":true},\"filterValue\":null,\"searchText\":\"\",\"pageIndex\":0,\"pageSize\":20,\"selectedRowKeys\":[]}",
  name: 'Liste d\'Inscription - Par membre du ménage',
} as IQuery;