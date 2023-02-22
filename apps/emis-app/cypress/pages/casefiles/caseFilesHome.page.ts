import { IMemberEntity } from '@libs/entities-lib/household-create';
import { HouseholdProfilePage } from './houseHoldProfile.page';

export enum DataTest {
  beneficiaryNameLink = 'beneficiaryName-link',
}

export class CaseFilesHomePage {
  public waitUntilBeneficiaryIsDisplayed(primaryBeneficiary: IMemberEntity) {
    const beneficiarySelector = { selector: `"${DataTest.beneficiaryNameLink}_${primaryBeneficiary.identitySet.firstName} ${primaryBeneficiary.identitySet.lastName}"`, type: 'a' };
    cy.waitItemsRefreshUntilDisplayed('case-file-entities', beneficiarySelector);
  }

  public goToHouseholdProfile(primaryBeneficiary: IMemberEntity) {
    const beneficiarySelector = { selector: `"${DataTest.beneficiaryNameLink}_${primaryBeneficiary.identitySet.firstName} ${primaryBeneficiary.identitySet.lastName}"`, type: 'a' };
    cy.getByDataTest(beneficiarySelector).click();
    return new HouseholdProfilePage();
  }
}
