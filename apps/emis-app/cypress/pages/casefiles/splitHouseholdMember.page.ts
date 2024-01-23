import { BeneficiarySearchPage } from '../registration/beneficiarySearch.page';

export enum DataTest {
  checkboxes = 'checkbox_member',
  saveButton = 'dialog-submit-action',
}

export class SplitHouseholdMemberPage {
  private checkboxes = { selector: DataTest.checkboxes, type: 'input' };

  private saveButton = { selector: DataTest.saveButton };

  public selectCheckBoxes() {
    cy.getByDataTestLike(this.checkboxes).each(($e1) => {
      cy.wrap($e1).check({ force: true });
    });
  }

  public transferHouseholdMembersByIndex(index = 0) {
    cy.getByDataTestLike(this.checkboxes).eq(index).check({ force: true });
  }

  public goToBeneficiarySearchPage() {
    cy.getByDataTest(this.saveButton).click();
    return new BeneficiarySearchPage();
  }
}
