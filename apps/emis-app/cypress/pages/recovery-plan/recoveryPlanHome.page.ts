import { splitDate } from '@libs/cypress-lib/helpers';
import { RecoveryPlanDetailsPage } from './recoveryPlanDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  descriptionRecoveryPlan = 'recoveryPlan_description',
  recoveryPlanYes = 'hasRecoveryPlan_yes',
  recoveryPlanNo = 'hasRecoveryPlan_no',
  recoveryPlanSave = 'recoveryPlan_saveBtn',
  recoveryPlanCancel = 'recoveryPlan_cancelBtn',
  crcProvidedRecoveryPlan = 'recoveryPlan_crcProvidedSection',
  crcProvidedYes = 'crcProvided_yes',
  crcProvidedNo = 'crcProvided_no',
  recoveryPlanStartDateSection = 'recoveryPlan_startDateSection',
  recoveryPlanStartDate = 'recoveryPlan_startDate',
  }

  export class RecoveryPlanHomePage {
    private pageTitle = { selector: DataTest.pageTitle };

    private descriptionRecoveryPlan = { selector: DataTest.descriptionRecoveryPlan };

    private recoveryPlanYes = { selector: DataTest.recoveryPlanYes, type: 'input' };

    private recoveryPlanNo = { selector: DataTest.recoveryPlanNo, type: 'input' };

    private recoveryPlanSave = { selector: DataTest.recoveryPlanSave };

    private recoveryPlanCancel = { selector: DataTest.recoveryPlanCancel };

    private crcProvidedRecoveryPlan = { selector: DataTest.crcProvidedRecoveryPlan };

    private crcProvidedYes = { selector: DataTest.crcProvidedYes, type: 'input' };

    private crcProvidedNo = { selector: DataTest.crcProvidedNo, type: 'input' };

    private recoveryPlanStartDateSection = { selector: DataTest.recoveryPlanStartDateSection };

    private recoveryPlanStartDate = { selector: DataTest.recoveryPlanStartDate };

    public getPageTitleElement() {
      return cy.getByDataTest(this.pageTitle);
    }

    public getRecoveryPlanDescription() {
      return cy.getByDataTest(this.descriptionRecoveryPlan).getAndTrimText();
    }

    public getRecoveryPlanYesButton() {
      return cy.getByDataTest(this.recoveryPlanYes);
    }

    public getRecoveryPlanNoButton() {
      return cy.getByDataTest(this.recoveryPlanNo);
    }

    public getRecoveryPlanSaveButton() {
      return cy.getByDataTest(this.recoveryPlanSave);
    }

    public getRecoveryPlanCancelButton() {
      return cy.getByDataTest(this.recoveryPlanCancel);
    }

    public getCrcProvidedRecoveryPlanDescription() {
      return cy.getByDataTest(this.crcProvidedRecoveryPlan).getAndTrimText();
    }

    public getCrcProvidedYesButton() {
      return cy.getByDataTest(this.crcProvidedYes);
    }

    public getCrcProvidedNoButton() {
      return cy.getByDataTest(this.crcProvidedNo);
    }

    public getRecoveryPlanStartDateSection() {
      return cy.getByDataTest(this.recoveryPlanStartDateSection).getAndTrimText();
    }

    public selectDate(date: string | Date) {
      const { year, month, day } = splitDate(date.toString());
      cy.setDatePicker(DataTest.recoveryPlanStartDate, { year, month, day });
    }

    public saveRecoveryPlan() {
      cy.getByDataTest(this.recoveryPlanSave).click();
      return new RecoveryPlanDetailsPage();
    }
  }
