import { ReferralDetailsPage } from './referralDetails.page';

export enum DataTest {
  organizationName = 'referral-name',
  referralType = 'referral-type',
  referralNotes = 'referral-notes_input',
  warmReferral = 'refmethod_warm',
  add = 'save',
  dialogTitle = 'dialog-title',
  dialogReferralCheckbox = 'checkbox-consent',
  dialogCrcUsername = 'crc-username',
  dialogSubmit = 'dialog-submit-action',
}

export class AddNewReferralPage {
  private organizationName = { selector: DataTest.organizationName, type: 'input' };

  private referralNotes = { selector: DataTest.referralNotes, type: 'textarea' };

  private add = { selector: DataTest.add };

  private warmReferral = { selector: DataTest.warmReferral };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogReferralCheckbox = { selector: DataTest.dialogReferralCheckbox, type: 'input' };

  private crcUsername = { selector: DataTest.dialogCrcUsername };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

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

  public addWarmReferral() {
    cy.getByDataTest(this.warmReferral).check({ force: true });
  }

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public checkIndividualAgreesToReceiveReferrals() {
    cy.getByDataTest(this.dialogReferralCheckbox).check({ force: true });
  }

  public getCrcUserNameElement() {
    return cy.getByDataTest(this.crcUsername);
  }

  public submitWarmReferralConsent() {
    return cy.getByDataTest(this.dialogSubmit).click();
  }
}
