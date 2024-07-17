import { ReferralDetailsPage } from './referralDetails.page';

export enum DataTest {
  organizationName = 'referral-name',
  referralType = 'referral-type',
  referralNotes = 'referral-notes_input',
  add = 'save',
}

export class AddNewReferralPage {
  private organizationName = { selector: DataTest.organizationName, type: 'input' };

  private referralNotes = { selector: DataTest.referralNotes, type: 'textarea' };

  private add = { selector: DataTest.add };

  public addReferralOrganizationName(orgName: string) {
    cy.getByDataTest(this.organizationName).type(orgName);
  }

  public referralType(referral: string) {
    cy.selectListElementByValue(DataTest.referralType, referral);
  }

  public addReferralNotes(notes: string) {
    cy.getByDataTest(this.referralNotes).type(notes);
  }

  public addReferral() {
    cy.getByDataTest(this.add).click();
    return new ReferralDetailsPage();
  }
}
