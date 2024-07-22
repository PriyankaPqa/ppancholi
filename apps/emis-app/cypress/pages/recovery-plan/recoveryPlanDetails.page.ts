import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  recoveryPlanEditButton = 'recoveryPlan_EditBtn',
  recoveryPlanUploadButton = 'recoveryPlan_uploadBtn',
  hasRecoveryPlan = 'has-recovery-plan',
  recoveryPlanCrcProvided = 'crc-provided-recovery-plan',
  recoveryPlanCrcProvidedDate = 'crc-provided-recovery-plan-date',
  caseFileActivityTab = 'case-file-activity',
}

  export class RecoveryPlanDetailsPage {
    private recoveryPlanEditButton = { selector: DataTest.recoveryPlanEditButton };

    private recoveryPlanUploadButton = { selector: DataTest.recoveryPlanUploadButton };

    private hasRecoveryPlan = { selector: DataTest.hasRecoveryPlan };

    private recoveryPlanCrcProvided = { selector: DataTest.recoveryPlanCrcProvided };

    private recoveryPlanCrcProvidedDate = { selector: DataTest.recoveryPlanCrcProvidedDate };

    private caseFileActivityTab = { selector: DataTest.caseFileActivityTab };

    public getRecoveryPlanEditButton() {
      return cy.getByDataTest(this.recoveryPlanEditButton);
    }

    public getRecoveryPlanUploadButton() {
      return cy.getByDataTest(this.recoveryPlanUploadButton);
    }

    public getHasRecoveryPlanEstablished() {
      return cy.getByDataTest(this.hasRecoveryPlan).getAndTrimText();
    }

    public getCrcProvidedRecoveryPlanSupport() {
      return cy.getByDataTest(this.recoveryPlanCrcProvided).getAndTrimText();
    }

    public getCrcProvidedRecoveryPlanDate() {
      return cy.getByDataTest(this.recoveryPlanCrcProvidedDate).getAndTrimText();
    }

    public goToCaseFileDetailsPage() {
      cy.getByDataTest(this.caseFileActivityTab).click();
      return new CaseFileDetailsPage();
    }
  }
