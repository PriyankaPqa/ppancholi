export enum DataTest {
  backToCaseFileHomeButton = 'back-button',
  beneficiaryName = 'title-left-menu',
  caseFileNumber = 'caseFileDetails-caseFileNumber',
  eventName = 'caseFileDetails-event',
  verificationOfIdentityButton = 'caseFileDetails-verify-identity-icon',
  verificationOfImpactButton = 'caseFileDetails-verify-impact-icon',
  phoneNumber = 'caseFileDetails-beneficiary-phone-number',
  homeAddress = 'caseFileDetails-home-address',
  householdMemberCount = 'caseFileDetails-household-member-count',
  totalImpactedCount = 'caseFileDetails-receiving-assistance-member-count',
  householdProfileButton = 'household-profile-btn',
  caseFileActivitySubTag = 'case-file-activity',
  caseNoteSubTag = 'case-note',
  assessmentsSubTag = 'assessments',
  caseFinancialAssistanceSubTag = 'case-financial-assistance',
  referralsSubTag = 'referrals',
  impactedIndividualsSubTag = 'impacted_individuals',
  recoveryPlanSubTag = 'recovery-plan',
  documentsSubTag = 'documents',
  tasksSubTag = 'tasks',
  statusSelect = 'statusSelect__chip',
}
export class CaseFileDetailsBase {
  private backToCaseFileHomeButton = { selector: DataTest.backToCaseFileHomeButton };

  private beneficiaryName = { selector: DataTest.beneficiaryName };

  private caseFileNumber = { selector: DataTest.caseFileNumber };

  private eventName = { selector: DataTest.eventName };

  private verificationOfIdentityButton = { selector: DataTest.verificationOfIdentityButton };

  private verificationOfImpactButton = { selector: DataTest.verificationOfImpactButton };

  private phoneNumber = { selector: DataTest.phoneNumber };

  private homeAddress = { selector: DataTest.homeAddress };

  private householdMemberCount = { selector: DataTest.householdMemberCount };

  private totalImpactedCount = { selector: DataTest.totalImpactedCount };

  private householdProfileButton = { selector: DataTest.householdProfileButton };

  private caseFileActivitySubTag = { selector: DataTest.caseFileActivitySubTag };

  private caseNoteSubTag = { selector: DataTest.caseNoteSubTag };

  private assessmentsSubTag = { selector: DataTest.assessmentsSubTag };

  private caseFinancialAssistanceSubTag = { selector: DataTest.caseFinancialAssistanceSubTag };

  private referralsSubTag = { selector: DataTest.referralsSubTag };

  private impactedIndividualsSubTag = { selector: DataTest.impactedIndividualsSubTag };

  private recoveryPlanSubTag = { selector: DataTest.recoveryPlanSubTag };

  private documentsSubTag = { selector: DataTest.documentsSubTag };

  private tasksSubTag = { selector: DataTest.tasksSubTag };

  private statusSelect = { selector: DataTest.statusSelect };

  public getBackToCaseFileHomeButton() {
    return cy.getByDataTest(this.backToCaseFileHomeButton);
  }

  public getBeneficiaryName() {
    return cy.getByDataTest(this.beneficiaryName).getAndTrimText();
  }

  public getCaseFileNumber() {
    return cy.getByDataTest(this.caseFileNumber).getAndTrimText();
  }

  public getEventName() {
    return cy.getByDataTest(this.eventName).getAndTrimText();
  }

  public getVerificationOfIdentityButton() {
    return cy.getByDataTest(this.verificationOfIdentityButton);
  }

  public getVerificationOfImpactButton() {
    return cy.getByDataTest(this.verificationOfImpactButton);
  }

  public getPhoneNumber() {
    return cy.getByDataTest(this.phoneNumber).getAndTrimText();
  }

  public getHomeAddress() {
    return cy.getByDataTest(this.homeAddress).getAndTrimText();
  }

  public getHouseholdMemberCount() {
    return cy.getByDataTest(this.householdMemberCount).getAndTrimText();
  }

  public getTotalImpactedCount() {
    return cy.getByDataTest(this.totalImpactedCount).getAndTrimText();
  }

  public getHouseholdProfileButton() {
    return cy.getByDataTest(this.householdProfileButton);
  }

  public goToHouseholdProfilePage() {
    return this.getHouseholdProfileButton().click();
  }

  public getCaseFileActivitySubTag() {
    return cy.getByDataTest(this.caseFileActivitySubTag);
  }

  public goToCaseFileActivityPage() {
    return this.getCaseFileActivitySubTag().click();
  }

  public getCaseNoteSubTag() {
    return cy.getByDataTest(this.caseNoteSubTag);
  }

  public getAssessmentsSubTag() {
    return cy.getByDataTest(this.assessmentsSubTag);
  }

  public getCaseFinancialAssistanceSubTag() {
    return cy.getByDataTest(this.caseFinancialAssistanceSubTag);
  }

  public getReferralsSubTag() {
    return cy.getByDataTest(this.referralsSubTag);
  }

  public getImpactedIndividualsSubTag() {
    return cy.getByDataTest(this.impactedIndividualsSubTag);
  }

  public getRecoveryPlanSubTag() {
    return cy.getByDataTest(this.recoveryPlanSubTag);
  }

  public getDocumentsSubTag() {
    return cy.getByDataTest(this.documentsSubTag);
  }

  public getTasksSubTag() {
    return cy.getByDataTest(this.tasksSubTag);
  }

  public goToCaseNotesPage() {
    cy.getByDataTest(this.caseNoteSubTag).click();
  }

  public goToFinancialAssistanceHomePage() {
    return cy.getByDataTest(this.caseFinancialAssistanceSubTag).click();
  }

  public getStatusText() {
    return cy.getByDataTest(this.statusSelect).getAndTrimText();
  }
}
