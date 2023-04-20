import { MemberCreateRequest } from '@libs/entities-lib/household-create';
import { HouseholdProfilePage } from './householdProfile.page';
import { CaseFileDetailsPage } from './caseFileDetails.page';

export enum DataTest {
  beneficiaryNameLink = 'beneficiaryName-link',
  caseFileDetailLink = 'caseFileDetail-link',
  caseFileTable = 'case-files-table',
}

export class CaseFilesHomePage {
  private beneficiaryNameLink = { selector: DataTest.beneficiaryNameLink };

  private caseFileDetailLink = { selector: DataTest.caseFileDetailLink };

  private caseFileTable = { selector: DataTest.caseFileTable };

  public waitUntilBeneficiaryIsDisplayed(primaryBeneficiary: MemberCreateRequest) {
    const beneficiarySelector = { selector: `"${DataTest.beneficiaryNameLink}_${primaryBeneficiary.identitySet.firstName} ${primaryBeneficiary.identitySet.lastName}"`, type: 'a' };
    cy.waitItemsRefreshUntilDisplayed('case-file-entities', beneficiarySelector);
  }

  public goToHouseholdProfile(primaryBeneficiary: MemberCreateRequest) {
    const beneficiarySelector = { selector: `"${DataTest.beneficiaryNameLink}_${primaryBeneficiary.identitySet.firstName} ${primaryBeneficiary.identitySet.lastName}"`, type: 'a' };
    cy.getByDataTest(beneficiarySelector).click();
    return new HouseholdProfilePage();
  }

  public getFirstAvailableHousehold() {
    cy.getByDataTestLike(this.beneficiaryNameLink).eq(0).click();
    return new HouseholdProfilePage();
  }

  public getFirstAvailableCaseFile() {
    cy.getByDataTestLike(this.caseFileDetailLink).eq(0).click();
    return new CaseFileDetailsPage();
  }

  public getCaseFileTable() {
    return cy.getByDataTest(this.caseFileTable);
  }
}
