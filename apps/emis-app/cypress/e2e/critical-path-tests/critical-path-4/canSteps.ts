import { getToday } from '@libs/cypress-lib/helpers';
import { IAddressData } from '@libs/entities-lib/household-create';
import { HouseholdProfilePage } from '../../../pages/casefiles/householdProfile.page';

export interface PotentialDuplicateCreatedStepsParams {
  firstName: string,
  lastName: string,
  registrationNumber: string,
  caseFileNumber: string,
  eventName: string,
  phoneNumber?: string,
  duplicateHouseholdAddress?: IAddressData,
  potentialDuplicateBasis: string,
}

export enum PotentialDuplicateBasis {
  'PhoneNumber' = 'PhoneNumber',
  'HomeAddress' = 'HomeAddress',
  'NameAndDob' = 'NameAndDob',
}

export const potentialDuplicateCreatedSteps = (params: PotentialDuplicateCreatedStepsParams) => {
  const householdProfilePage = new HouseholdProfilePage();
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
