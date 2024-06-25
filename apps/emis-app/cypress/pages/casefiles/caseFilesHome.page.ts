import { MemberCreateRequest } from '@libs/entities-lib/household-create';
import { HouseholdProfilePage } from './householdProfile.page';
import { CaseFileDetailsPage } from './caseFileDetails.page';

export enum DataTest {
  beneficiaryNameLink = 'beneficiaryName-link',
  caseFileDetailLink = 'caseFileDetail-link',
  caseFileTable = 'case-files-table',
  search = 'dataTableHeader__search',
  statusText = 'chip-text',
}

export class CaseFilesHomePage {
  private beneficiaryNameLink = { selector: DataTest.beneficiaryNameLink };

  private caseFileDetailLink = { selector: DataTest.caseFileDetailLink };

  private caseFileTable = { selector: DataTest.caseFileTable };

  private statusText = { selector: DataTest.statusText };

  public waitUntilBeneficiaryIsDisplayed(primaryBeneficiary: MemberCreateRequest) {
    const beneficiarySelector = { selector: `"${DataTest.beneficiaryNameLink}_${primaryBeneficiary.identitySet.firstName} ${primaryBeneficiary.identitySet.lastName}"`, type: 'a' };
    cy.waitItemsRefreshUntilDisplayed('case-file-entities', beneficiarySelector);
  }

  public goToFirstHouseholdProfile(firstName: string, lastName: string) {
    const beneficiarySelector = { selector: `"${DataTest.beneficiaryNameLink}_${firstName} ${lastName}"`, type: 'a' };
    cy.getByDataTest(beneficiarySelector).eq(0).click();
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

  public goToCaseFileDetail(caseFileNumber: string) {
    cy.getByDataTest({ selector: `${this.caseFileDetailLink.selector}_${caseFileNumber}` }).click();
    return new CaseFileDetailsPage();
  }

  public getCaseFileTable() {
    return cy.getByDataTest(this.caseFileTable);
  }

  public refreshUntilCaseFilesUpdated(beneficiaryName: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getCaseFileTable().should('be.visible'),
        checkCondition: () => Cypress.$(`[data-test="beneficiaryName-link_${beneficiaryName}"]`).length > 0,
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        actionsAfterReload: () => cy.wait(4000),
      },
      {
        timeoutInSec: 60,
        errorMsg: 'Failed to update Case Files',
        foundMsg: 'Case File updated',
      },
    );
  }

  public searchCaseFileTableFor(caseFileNumber: string) {
    cy.typeAndWaitUntilSearchResultsVisible(caseFileNumber, DataTest.search, `${DataTest.caseFileDetailLink}_${caseFileNumber}`);
  }

  public getCaseFileStatus() {
    return cy.getByDataTestLike(this.statusText).getAndTrimText();
  }
}
