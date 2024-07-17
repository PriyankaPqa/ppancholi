import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  organizationName = 'organization-name',
  referralType = 'referral_details_type',
  editReferral = 'editReferral-link',
  notesReferral = 'referral_details_notes',
  methodReferral = 'referral_details_method',
  backToReferrals = 'referral_details_back_btn',
  caseFileActivityTab = 'item-text-0',
}

export class ReferralDetailsPage {
  private organizationName = { selector: DataTest.organizationName };

  private referralType = { selector: DataTest.referralType };

  private editReferral = { selector: DataTest.editReferral };

  private notesReferral = { selector: DataTest.notesReferral };

  private methodReferral = { selector: DataTest.methodReferral };

  private backToReferrals = { selector: DataTest.backToReferrals };

  private caseFileActivityTab = { selector: DataTest.caseFileActivityTab };

  public getReferralOrganizationNameElement() {
    return cy.getByDataTest(this.organizationName);
  }

  public getReferralType() {
    return cy.getByDataTest(this.referralType).getAndTrimText();
  }

  public getEditReferralButton() {
    return cy.getByDataTest(this.editReferral);
  }

  public getReferralNotes() {
    return cy.getByDataTest(this.notesReferral).getAndTrimText();
  }

  public getReferralMethod() {
    return cy.getByDataTest(this.methodReferral).getAndTrimText();
  }

  public getBackToReferralButton() {
    return cy.getByDataTest(this.backToReferrals);
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileActivityTab).click();
    return new CaseFileDetailsPage();
  }
}
