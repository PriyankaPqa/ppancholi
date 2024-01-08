import { getToday } from '@libs/cypress-lib/helpers';
import { IAddressData } from '@libs/entities-lib/household-create';
import { UserRoles } from '@libs/cypress-lib/support/msal';
import { CrcRegistrationPage } from 'cypress/pages/registration/crcRegistration.page';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { ConfirmBeneficiaryRegistrationPage } from 'cypress/pages/registration/confirmBeneficiaryRegistration.page';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

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

export const potentialDuplicateCreatedSteps = (params: PotentialDuplicateCreatedStepsParams) => {
  const householdProfilePage = new HouseholdProfilePage();

  if (params.roleName === UserRoles.level0) {
    householdProfilePage.getDuplicatesIcon().should('be.visible');
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
  caseFileDetailsPage.getUserName().should('eq', 'System');
  caseFileDetailsPage.getCaseFileActivityTitle(0).should('string', 'Potential duplicate flagged');
  caseFileDetailsPage.getCaseFileActivityBody(0).should('string', `This household has been identified as a potential duplicate with  #${params.registrationNumber}`)
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
  crcPrivacyStatementPage.fillPrivacyRegistrationMethod('Phone');

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
