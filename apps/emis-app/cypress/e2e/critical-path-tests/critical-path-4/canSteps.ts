import { getToday } from '@libs/cypress-lib/helpers';
import { IAddressData, IIdentitySetCreateRequest, MemberCreateRequest } from '@libs/entities-lib/household-create';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { IPersonalInfoFields, PersonalInformationPage, PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { getUserName, getUserRoleDescription } from '@libs/cypress-lib/helpers/users';
import { ConfirmBeneficiaryRegistrationPage } from '../../../pages/registration/confirmBeneficiaryRegistration.page';
import { CRCPrivacyStatementPage, PrivacyRegistrationMethod } from '../../../pages/registration/crcPrivacyStatement.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';
import { CrcRegistrationPage } from '../../../pages/registration/crcRegistration.page';
import { UpdateDuplicateRecordTo, ResolvedBy } from '../../../pages/manage-duplicates/manageDuplicates.page';

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
  rationale?: string
  flaggedBy?: string
  flaggedByUserName?: string,
  manuallyCreatedDuplicateName?: MemberCreateRequest,
}

export enum PotentialDuplicateBasis {
  'PhoneNumber' = 'PhoneNumber',
  'HomeAddress' = 'HomeAddress',
  'NameAndDob' = 'NameAndDob',
  'ManualDuplicateName' = 'ManualDuplicateName',
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

export interface ManualDuplicateCreatedStepsParams {
  comparisonHouseholdPrimaryBeneficiary: MemberCreateRequest,
  originalHouseholdRegistrationNumber: string,
  firstName: string,
  lastName: string,
  duplicatedBy: string,
  potentialDuplicateBasis?: string,
}

export interface CaseFileDetailsPageAssertionStepsParams {
  roleName: string,
  registrationNumber: string,
  rationale: string,
  updateDuplicateRecordTo: string,
  resolvedBy: string,
}

export enum DuplicatedBy {
  'FullName' = 'Full Name',
  'HomePhoneNumber' = 'Home Phone Number',
}

export interface ManuallyUpdatePotentialDuplicateRecordStatusStepsParams {
  rationale: string,
  firstName: string,
  lastName: string,
  registrationNumber: string,
  caseFileNumber: string,
  eventName: string,
  phoneNumber: string,
  roleName: string,
  updateDuplicateRecordTo: string,
  dialogUpdateRecordStatusTitle: string,
  dialogFlagAsText: string,
  dialogLabelMandatoryText: string,
  resolvedBy: string,
}

// eslint-disable-next-line
export const potentialDuplicateCreatedSteps = ({ roleName, firstName, lastName, registrationNumber, caseFileNumber, eventName, potentialDuplicateBasis, duplicateHouseholdAddress, phoneNumber, caseFileLogIndex, rationale = 'Flagged by the system', flaggedBy = 'System', flaggedByUserName = 'System', manuallyCreatedDuplicateName }: Partial<PotentialDuplicateCreatedStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();

  if (roleName === UserRoles.level0) {
    householdProfilePage.getDuplicatesIcon().scrollIntoView().should('be.visible');
    householdProfilePage.getManageDuplicatesButton().should('not.exist');
  } else {
    const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
    manageDuplicatesPage.getDuplicateHouseholdPrimaryMemberName().should('eq', `${firstName} ${lastName}`);
    manageDuplicatesPage.getDuplicateHouseholdRegistrationNumber().should('eq', `Registration number: ${registrationNumber}`);
    manageDuplicatesPage.getDuplicateHouseholdCaseFileData()
      .should('string', `Case file number: ${caseFileNumber}`)
      .and('string', `Event: ${eventName}`);
    if (potentialDuplicateBasis === PotentialDuplicateBasis.PhoneNumber) {
      manageDuplicatesPage.getDuplicatePhoneNumber().should('eq', phoneNumber);
    } else if (potentialDuplicateBasis === PotentialDuplicateBasis.HomeAddress) {
      manageDuplicatesPage.getDuplicateHouseholdDetails()
        .should(
          'eq',
          `${duplicateHouseholdAddress.unitSuite}-${duplicateHouseholdAddress.streetAddress}, Quebec, AB, ${duplicateHouseholdAddress.postalCode}, Canada`,
        );
    } else if (potentialDuplicateBasis === PotentialDuplicateBasis.NameAndDob) {
      manageDuplicatesPage.getDuplicateName().should('eq', `${firstName} ${lastName}`);
    } else if (potentialDuplicateBasis === PotentialDuplicateBasis.ManualDuplicateName) {
      manageDuplicatesPage.getDuplicateName().should('eq', `${manuallyCreatedDuplicateName.identitySet.firstName} ${manuallyCreatedDuplicateName.identitySet.lastName}`);
    }
    manageDuplicatesPage.getDuplicateHistoryStatusByIndex().should('eq', 'Flagged as potential');
    manageDuplicatesPage.getDuplicateHistoryUserByIndex().should('string', `By: ${flaggedBy}`).and('string', getToday());
    manageDuplicatesPage.getDuplicateHistoryRationaleByIndex().should('eq', `Rationale: ${rationale}`);
    manageDuplicatesPage.getActionDropdownInput().should('exist');
    manageDuplicatesPage.goToHouseholdProfilePage();
  }

  const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody('potential duplicate');
  caseFileDetailsPage.getAllUserName().should('string', flaggedByUserName);
  caseFileDetailsPage.getAllCaseFileActivityTitle().should('string', 'Potential duplicate flagged');
  caseFileDetailsPage.getAllCaseFileActivityBody()
    .should('string', `This household has been identified as a potential duplicate with  #${registrationNumber}`)
    .and('string', `Rationale: ${rationale}`);
  caseFileDetailsPage.goToDuplicateHouseholdProfilebyIndex(registrationNumber);

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
    const splitConfirmationPage = reviewSplitInformationPage.goToSplitConfirmationPage();
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
    const errorConfirmRegistrationPage = reviewSplitInformationPage.goToErrorConfirmRegistrationPage();
    errorConfirmRegistrationPage.getErrorTitleDuplicateRegistration().should('eq', 'This individual already exists in the system');
    cy.contains('Please use the household search page to associate the household with this event.').should('be.visible');
    errorConfirmRegistrationPage.getSearchHouseholdButton().should('be.visible');
    errorConfirmRegistrationPage.getCancelButton().should('be.visible');
    errorConfirmRegistrationPage.getPrintButton().should('be.visible');
  }
};

export const manualDuplicateCreatedSteps = (params: Partial<ManualDuplicateCreatedStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();
  const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
  manageDuplicatesPage.getFlagNewDuplicateButton().click();
  cy.contains('Flag a new household as a potential duplicate with '
    + `${params.comparisonHouseholdPrimaryBeneficiary.identitySet.firstName} ${params.comparisonHouseholdPrimaryBeneficiary.identitySet.lastName}`)
    .should('be.visible');
  manageDuplicatesPage.getFlagNewHouseholdRegistrationNumberField(params.originalHouseholdRegistrationNumber);
  manageDuplicatesPage.provideFlagNewDuplicateRationale('This is a potential duplicate');
  manageDuplicatesPage.selectDuplicatedBy(params.duplicatedBy);
  if (params.potentialDuplicateBasis === PotentialDuplicateBasis.ManualDuplicateName) {
    manageDuplicatesPage.selectHouseholdMemberByValue(`${params.firstName} ${params.lastName}`);
  }
  manageDuplicatesPage.submitFlagNewDuplicate();
  cy.contains('Household was successfully flagged as potential duplicate').should('be.visible');
  manageDuplicatesPage.getTabPotentialDuplicates().contains('Potential duplicates (1)').should('be.visible');
  manageDuplicatesPage.goToHouseholdProfilePage();
};

// eslint-disable-next-line
export const manuallyUpdatePotentialDuplicateRecordStatusSteps = ({ rationale, updateDuplicateRecordTo, dialogUpdateRecordStatusTitle, dialogFlagAsText, dialogLabelMandatoryText }: Partial<ManuallyUpdatePotentialDuplicateRecordStatusStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();
  const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();
  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    manageDuplicatesPage.getTabResolved().click();
  }
  manageDuplicatesPage.getActionDropdownInput().click();
  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    manageDuplicatesPage.selectActionMenuResolved();
  } else if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    manageDuplicatesPage.selectActionMenuPotential();
  }
  cy.contains(dialogUpdateRecordStatusTitle).should('be.visible');
  manageDuplicatesPage.getFlagAsText().should('eq', `Flag as: ${dialogFlagAsText}`);
  manageDuplicatesPage.actionDialogRationaleElement().should('have.attr', 'label').and('contains', dialogLabelMandatoryText);
  manageDuplicatesPage.getDialogCancelButton().should('be.visible');
  manageDuplicatesPage.getDialogSaveButton().should('be.visible');
  manageDuplicatesPage.provideActionDialogRationale(rationale);
  manageDuplicatesPage.getDialogSaveButton().click();
  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    manageDuplicatesPage.getTabPotentialDuplicates().contains('Potential duplicates (0)').should('be.visible');
  } else if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    manageDuplicatesPage.getTabPotentialDuplicates().contains('Potential duplicates (1)').should('be.visible');
  }
  manageDuplicatesPage.goToHouseholdProfilePage();
};

// eslint-disable-next-line
export const assertUpdatedPotentialDuplicateRecordTabSteps = ({ rationale, firstName, lastName, registrationNumber, caseFileNumber, eventName, phoneNumber, roleName, updateDuplicateRecordTo, resolvedBy }: Partial<ManuallyUpdatePotentialDuplicateRecordStatusStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();

  const manageDuplicatesPage = householdProfilePage.goToManageDuplicatesPage();

  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    manageDuplicatesPage.getTabResolved().contains('Resolved (1)').should('be.visible');
  } else if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    manageDuplicatesPage.getTabResolved().contains('Resolved (0)').should('be.visible');
  }

  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    manageDuplicatesPage.getTabResolved().click();
  }

  manageDuplicatesPage.getDuplicateHouseholdPrimaryMemberName().should('eq', `${firstName} ${lastName}`);
  manageDuplicatesPage.getDuplicateHouseholdRegistrationNumber().should('eq', `Registration number: ${registrationNumber}`);
  manageDuplicatesPage.getDuplicateHouseholdCaseFileData()
    .should('string', `Case file number: ${caseFileNumber}`)
    .and('string', `Event: ${eventName}`);
  manageDuplicatesPage.getDuplicatePhoneNumber().should('eq', phoneNumber);

  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    manageDuplicatesPage.getDuplicateHistoryStatusByIndex().should('eq', 'Flagged as potential');
    manageDuplicatesPage.getDuplicateHistoryUserByIndex().should('string', 'By: System').and('string', getToday());
    manageDuplicatesPage.getDuplicateHistoryRationaleByIndex().should('eq', 'Rationale: Flagged by the system');
    manageDuplicatesPage.getDuplicateHistoryStatusByIndex(1).should('eq', 'Flagged as resolved');
    if (resolvedBy === ResolvedBy.Manually) {
      manageDuplicatesPage.getDuplicateHistoryUserByIndex(1).should('string', `By: ${getUserName(roleName)} (${getUserRoleDescription(roleName)})`).and('string', getToday());
    } else if (resolvedBy === ResolvedBy.System) {
      manageDuplicatesPage.getDuplicateHistoryUserByIndex(1).should('string', 'System').and('string', getToday());
    }
    manageDuplicatesPage.getDuplicateHistoryRationaleByIndex(1).should('eq', `Action taken: ${rationale}`);
    manageDuplicatesPage.getDuplicateActionDropdownText().should('string', 'Resolved');
  } else if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    manageDuplicatesPage.getDuplicateHistoryStatusByIndex(2).should('eq', 'Flagged as potential');
    manageDuplicatesPage.getDuplicateHistoryUserByIndex(2).should('string', `By: ${getUserName(roleName)} (${getUserRoleDescription(roleName)})`).and('string', getToday());
    manageDuplicatesPage.getDuplicateHistoryRationaleByIndex(2).should('eq', `Rationale: ${rationale}`);
    manageDuplicatesPage.getDuplicateActionDropdownText().should('string', 'Potential');
  }
  manageDuplicatesPage.goToHouseholdProfilePage();
};

// eslint-disable-next-line
export const caseFileDetailsPageAssertionSteps = ({ roleName, registrationNumber, rationale, updateDuplicateRecordTo, resolvedBy }: Partial<CaseFileDetailsPageAssertionStepsParams>) => {
  const householdProfilePage = new HouseholdProfilePage();
  const caseFileDetailsPage = householdProfilePage.goToCaseFileDetailsPage();
  caseFileDetailsPage.waitAndRefreshUntilCaseFileActivityVisibleWithBody(rationale);

  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    caseFileDetailsPage.getUserName().should('eq', getUserName(roleName));
    caseFileDetailsPage.getCaseFileActivityTitle().should('string', 'Potential duplicate flagged');
    caseFileDetailsPage.getCaseFileActivityBody()
      .should('string', `This household has been identified as a potential duplicate with  #${registrationNumber}`)
      .and('string', `Rationale: ${rationale}`);
  } else if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    if (resolvedBy === ResolvedBy.Manually) {
      caseFileDetailsPage.getAllUserName().should('string', getUserName(roleName));
    } else if (resolvedBy === ResolvedBy.System) {
      caseFileDetailsPage.getAllUserName().should('string', 'System');
    }
    caseFileDetailsPage.getAllCaseFileActivityTitle().should('string', 'Resolved potential duplicate');
    caseFileDetailsPage.getAllCaseFileActivityBody()
      .should('string', `The potential duplicate with  #${registrationNumber}  has been resolved`)
      .and('string', `Action taken to resolve: ${rationale}`);
  }
  caseFileDetailsPage.goToDuplicateHouseholdProfilebyIndex(registrationNumber);

  householdProfilePage.getDuplicatesIcon().should('be.visible');
  if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Potential) {
    householdProfilePage.getDuplicatesCount().should('eq', '1 potential duplicate(s)');
  } else if (updateDuplicateRecordTo === UpdateDuplicateRecordTo.Resolved) {
    householdProfilePage.getDuplicatesCount().should('eq', '0 potential duplicate(s)');
  }
};

export const assertPotentialDuplicatesSteps = (params: Partial<PotentialDuplicateCreatedStepsParams>) => {
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
      manageDuplicatesPage.getDuplicateName().should('eq', `${params.firstName} ${params.lastName}`);
    manageDuplicatesPage.getDuplicateHistoryStatusByIndex().should('eq', 'Flagged as potential');
    manageDuplicatesPage.getDuplicateHistoryUserByIndex().should('string', 'By: System').and('string', getToday());
    manageDuplicatesPage.getDuplicateHistoryRationaleByIndex().should('eq', 'Rationale: Flagged by the system');
    manageDuplicatesPage.getActionDropdownInput().should('exist');
    manageDuplicatesPage.goToHouseholdProfilePage();
  }
};
