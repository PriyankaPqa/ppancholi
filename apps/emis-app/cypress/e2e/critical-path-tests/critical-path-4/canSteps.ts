import { getToday } from '@libs/cypress-lib/helpers';
import { IAddressData, IIdentitySetCreateRequest, MemberCreateRequest } from '@libs/entities-lib/household-create';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IPersonalInfoFields, PersonalInformationPage, PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { ConfirmBeneficiaryRegistrationPage } from '../../../pages/registration/confirmBeneficiaryRegistration.page';
import { CRCPrivacyStatementPage, PrivacyRegistrationMethod } from '../../../pages/registration/crcPrivacyStatement.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';

export interface PotentialDuplicateCreatedStepsParams {
  firstName: string,
  lastName: string,
  registrationNumber: string,
  caseFileNumber: string,
  eventName: string,
  potentialDuplicateBasis: string,
  roleName: UserRoles,
  phoneNumber?: string,
  duplicateHouseholdAddress?: IAddressData,
  caseFileLogIndex?: number,
}

export enum PotentialDuplicateBasis {
  'PhoneNumber' = 'PhoneNumber',
  'HomeAddress' = 'HomeAddress',
  'NameAndDob' = 'NameAndDob',
}

export interface CrcRegisterPotentialDuplicateStepsParams {
  eventName: string,
  roleName: UserRoles,
  potentialDuplicateMemberData: IPersonalInfoFields,
  potentialDuplicateAddressData: IAddressPageFields,
  potentialDuplicateBasis?: string,
}

export interface MakePrimaryPotentialDuplicateStepsParams {
  roleName: UserRoles,
  potentialDuplicateMemberData: IPersonalInfoFields,
  makePrimaryMemberFirstName: string,
  makePrimaryMemberLastName: string,
  potentialDuplicateBasis: string,
}

export interface SplitHouseholdDuplicateHouseholdStepsParams {
  roleName: UserRoles,
  eventName: string
  originalHouseholdPrimaryBeneficiary: MemberCreateRequest,
  splitMemberHouesholdAddress: IAddressPageFields,
  splitMemberPhoneNumber: string,
  potentialDuplicateBasis: string,
  comparisonHouseholdNewPrimaryMember?: IIdentitySetCreateRequest,
}

export const potentialDuplicateCreatedSteps = (params: PotentialDuplicateCreatedStepsParams) => {
  const householdProfilePage = new HouseholdProfilePage();

  if (params.roleName === UserRoles.level0) {
    householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
    householdProfilePage.getManageDuplicatesButton().should('not.exist');
  } else {
    const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
    manageDuplicatesPage.getDuplicateHouseholdPrimaryMemberName().should('eq', `${params.firstName} ${params.lastName}`);
    manageDuplicatesPage.getDuplicateHouseholdRegistrationNumber().should('eq', `Registration number: ${params.registrationNumber}`);
    manageDuplicatesPage.getDuplicateHouseholdCaseFileData()
      .should('string', `Case file number: ${params.caseFileNumber}`)
      .and('string', `Event: ${params.eventName}`);
    if (params.potentialDuplicateBasis === PotentialDuplicateBasis.PhoneNumber) {
      manageDuplicatesPage.getDuplicatePhoneNumber().should('eq', params.phoneNumber);
    } else if (params.potentialDuplicateBasis === PotentialDuplicateBasis.HomeAddress) {
      manageDuplicatesPage.getDuplicateHouseholdDetails()
        .should(
          'eq',
          `${params.duplicateHouseholdAddress.unitSuite}-${params.duplicateHouseholdAddress.streetAddress}, Quebec, AB, ${params.duplicateHouseholdAddress.postalCode}, Canada`,
        );
    } else if (params.potentialDuplicateBasis === PotentialDuplicateBasis.NameAndDob) {
      manageDuplicatesPage.getDuplicateName().should('eq', `${params.firstName} ${params.lastName}`);
    }
    manageDuplicatesPage.getDuplicateHistoryStatus().should('eq', 'Flagged as potential');
    manageDuplicatesPage.getDuplicateHistoryUser().should('string', 'By: System').and('string', getToday());
    manageDuplicatesPage.getDuplicateHistoryRationale().should('eq', 'Rationale: Flagged by the system');
    manageDuplicatesPage.getActionDropdown().should('exist');
    manageDuplicatesPage.goToHouseholdProfilePage();
  }

  const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('potential duplicate');
  caseFileDetailsPage.getUserName(params.caseFileLogIndex).should('eq', 'System');
  caseFileDetailsPage.getCaseFileActivityTitle(params.caseFileLogIndex).should('string', 'Potential duplicate flagged');
  caseFileDetailsPage.getCaseFileActivityBody(params.caseFileLogIndex)
    .should('string', `This household has been identified as a potential duplicate with  #${params.registrationNumber}`)
    .and('string', 'Rationale: Flagged by the system');
  caseFileDetailsPage.goToDuplicateHouseholdProfile();

  householdProfilePage.getDuplicatesIcon().should('be.visible');
  householdProfilePage.getDuplicatesCount().should('eq', '1 potential duplicate(s)');
};

export const crcRegisterPotentialDuplicateSteps = (params: CrcRegisterPotentialDuplicateStepsParams) => {
  const crcRegistrationPage = new CrcRegistrationPage();
  crcRegistrationPage.getPageTitle().should('eq', 'Welcome, let\'s get started. Please select an event:');
  crcRegistrationPage.fillEvent(params.eventName);

  const beneficiarySearchPage = crcRegistrationPage.beginRegistration();

  const crcPrivacyStatementPage = beneficiarySearchPage.goToCrcPrivacyStatementPage();
  crcPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
  crcPrivacyStatementPage.fillUserNameIfEmpty(params.roleName);
  crcPrivacyStatementPage.fillPrivacyRegistrationMethod(PrivacyRegistrationMethod.Phone);

  const personalInformationPage = crcPrivacyStatementPage.goToPersonalInfoPage();

  personalInformationPage.fill(params.potentialDuplicateMemberData, '');
  if (params.potentialDuplicateBasis === PotentialDuplicateBasis.PhoneNumber) {
    personalInformationPage.fillPhoneNumber(params.potentialDuplicateMemberData.phoneNumber);
  }
  const addressPage = personalInformationPage.goToAddressPage();
  addressPage.fill(params.potentialDuplicateAddressData);

  const householdMembersPage = addressPage.goToHouseholdMembersPage();

  const reviewRegistrationPage = householdMembersPage.goToReviewPage();
  reviewRegistrationPage.goToConfirmationPage();

  const confirmBeneficiaryRegistrationPage = new ConfirmBeneficiaryRegistrationPage();
  confirmBeneficiaryRegistrationPage.getFullName()
    .should('string', params.potentialDuplicateMemberData.firstName)
    .and('string', params.potentialDuplicateMemberData.lastName);
  confirmBeneficiaryRegistrationPage.getMessage().should('string', ' is now registered!');
  confirmBeneficiaryRegistrationPage.getRegistrationNumber().should('exist');
  confirmBeneficiaryRegistrationPage.getEventName().should('string', params.eventName);
  confirmBeneficiaryRegistrationPage.getPrintButton().should('be.visible');
  confirmBeneficiaryRegistrationPage.getNewRegistrationButton().should('be.visible');

  const caseFilesHomePage = confirmBeneficiaryRegistrationPage.goToCaseFiles();
  caseFilesHomePage.refreshUntilCaseFilesUpdated(`${params.potentialDuplicateMemberData.firstName} ${params.potentialDuplicateMemberData.lastName}`);
  caseFilesHomePage.goToFirstHouseholdProfile(params.potentialDuplicateMemberData.firstName, params.potentialDuplicateMemberData.lastName);
};

export const makeMemberPrimarySteps = (params: MakePrimaryPotentialDuplicateStepsParams) => {
  const householdProfilePage = new HouseholdProfilePage();
  householdProfilePage.makeHouseholdPrimaryByIndex(0);
  cy.contains('Make new primary member').should('be.visible');
  // eslint-disable-next-line
  cy.contains(`Are you sure you want to make ${params.makePrimaryMemberFirstName} ${params.makePrimaryMemberLastName} a primary member of this household?`).should('be.visible');
  householdProfilePage.getDialogConfirmSubmitButton().should('be.visible');
  householdProfilePage.getDialogConfirmCancelButton().should('be.visible');
  householdProfilePage.getDialogConfirmSubmitButton().click();

  const cRCPrivacyStatementPage = new CRCPrivacyStatementPage();
  cRCPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
  cRCPrivacyStatementPage.fillUserNameIfEmpty(params.roleName);
  cRCPrivacyStatementPage.fillPrivacyRegistrationMethod(PrivacyRegistrationMethod.Phone);

  const personalInformationPage = new PersonalInformationPage();
  if (params.potentialDuplicateBasis === PotentialDuplicateBasis.NameAndDob) {
    personalInformationPage.fill(params.potentialDuplicateMemberData, '');
    // eslint-disable-next-line
    cy.contains('This individual appears to already exist in the system. Please confirm this individual is not a duplicate before proceeding.')
      .scrollIntoView()
      .should('be.visible');
  } else if (params.potentialDuplicateBasis === PotentialDuplicateBasis.PhoneNumber) {
    personalInformationPage.fillPhoneNumber(params.potentialDuplicateMemberData.phoneNumber);
  }
  personalInformationPage.selectPreferredLanguage(PreferredLanguage.English);
  householdProfilePage.getDialogApplyButton().click({ force: true });
};

// eslint-disable-next-line
export const splitHouseholdDuplicateHouseholdSteps = (params: SplitHouseholdDuplicateHouseholdStepsParams) => {
  const householdProfilePage = new HouseholdProfilePage();

  const splitHouseholdMemberPage = householdProfilePage.selectMemberToSplit();
  splitHouseholdMemberPage.transferHouseholdMembersByIndex();
  const beneficiarySearchPage = splitHouseholdMemberPage.goToBeneficiarySearchPage();

  const splitHouseholdPrivacyStatementPage = beneficiarySearchPage.goToSelectEventPage();

  const crcPrivacyStatementPage = splitHouseholdPrivacyStatementPage.fillEvent(params.eventName);
  crcPrivacyStatementPage.getPrivacyCheckbox().click({ force: true }).should('be.checked');
  crcPrivacyStatementPage.fillPrivacyRegistrationMethod(PrivacyRegistrationMethod.Phone);
  crcPrivacyStatementPage.fillUserNameIfEmpty(params.roleName);

  const personalInfoSplitMemberPage = crcPrivacyStatementPage.goToPersonalInfoSplitMemberPage();
  personalInfoSplitMemberPage.fillPhoneNumber(params.splitMemberPhoneNumber);
  personalInfoSplitMemberPage.selectPreferredLanguage(PreferredLanguage.English);

  const addressSplitHouseholdPage = personalInfoSplitMemberPage.goToAddressSplitHouseholdPage();
  addressSplitHouseholdPage.fill(params.splitMemberHouesholdAddress);

  const householdMembersAfterSplitPage = addressSplitHouseholdPage.goToHouseholdMembersAfterSplitPage();

  const reviewSplitInformationPage = householdMembersAfterSplitPage.goToReviewSplitInformationPage();

  if (params.potentialDuplicateBasis === PotentialDuplicateBasis.PhoneNumber || params.potentialDuplicateBasis === PotentialDuplicateBasis.HomeAddress) {
    const splitConfirmationPage = reviewSplitInformationPage.goToConfirmationPage();
    splitConfirmationPage.getMessage()
      .should('string', params.comparisonHouseholdNewPrimaryMember.firstName)
      .should('string', params.comparisonHouseholdNewPrimaryMember.lastName)
      .should('string', 'is now registered!');
    splitConfirmationPage.getEventName().should('string', params.eventName);
    splitConfirmationPage.getRegistrationNumber().as('registrationNumberDuplicateHousehold');
    cy.contains('A copy of this page has been sent to the primary household member by email.').should('be.visible');
    splitConfirmationPage.getCancelButton().should('be.visible');
    splitConfirmationPage.getPrintButton().should('be.visible');
    splitConfirmationPage.closeRegistration();
  } else if (params.potentialDuplicateBasis === PotentialDuplicateBasis.NameAndDob) {
    const errorConfirmRegistrationPage = reviewSplitInformationPage.goToConfirmationPage();
    cy.contains('Unable to complete registration').should('be.visible');
    errorConfirmRegistrationPage.getErrorTitleDuplicateRegistration().should('eq', 'This individual already exists in the system');
    cy.contains('Please use the household search page to associate the household with this event.').should('be.visible');
    errorConfirmRegistrationPage.getSearchHouseholdButton().should('be.visible');
    errorConfirmRegistrationPage.getCancelButton().should('be.visible');
    errorConfirmRegistrationPage.getPrintButton().should('be.visible');
  }
};
