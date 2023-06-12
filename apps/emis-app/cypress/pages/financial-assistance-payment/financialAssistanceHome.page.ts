import { formatDate } from '@libs/cypress-lib/helpers';
import { FinancialAssistanceDetailsPage } from './financialAssistanceDetails.page';
import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  faPayment = 'fap_link_',
  approvalStatus = 'chip-text',
  createdDate = 'fap_created',
  totalAmount = 'fap_total',
  groupTitle = 'caseFile-financialAssistance-expand-groupTitle',
  groupTotal = 'caseFile-financialAssistance-expand-groupTotal',
  groupPaymentStatus = 'caseFile-financialAssistance-expand-groupPaymentStatus',
  caseFileDetails = 'item-text-0',
}

export class FinancialAssistanceHomePage {
  private approvalStatus = { selector: DataTest.approvalStatus };

  private createdDate = { selector: DataTest.createdDate };

  private totalAmount = { selector: DataTest.totalAmount };

  private caseFileDetails = { selector: DataTest.caseFileDetails };

  private groupTitle = { selector: DataTest.groupTitle };

  private groupTotal = { selector: DataTest.groupTotal };

  private groupPaymentStatus = { selector: DataTest.groupPaymentStatus };

  private faPayment = { selector: DataTest.faPayment };

  public getFAPaymentById(financialAssistancePaymentId: string) {
    cy.getByDataTest({ selector: `${DataTest.faPayment}${financialAssistancePaymentId}` }).click();
    return new FinancialAssistanceDetailsPage();
  }

  public getFAPaymentNameById(financialAssistancePaymentId: string) {
    return cy.getByDataTest({ selector: `${DataTest.faPayment}${financialAssistancePaymentId}` }).invoke('text').then((text) => text.trim());
  }

  public getFAPaymentName() {
    return cy.getByDataTestLike(this.faPayment).invoke('text').then((text) => text.trim());
  }

  public getFAPayment() {
    cy.getByDataTestLike(this.faPayment).click();
    return new FinancialAssistanceDetailsPage();
  }

  public getApprovalStatus() {
    return cy.getByDataTest(this.approvalStatus).invoke('text').then((text) => text.trim());
  }

  public getFAPaymentCreatedDate() {
    return cy.getByDataTest(this.createdDate).invoke('text').then((date) => formatDate(date));
  }

  public getFAPaymentAmount() {
    return cy.getByDataTest(this.totalAmount).invoke('text').then((text) => text.trim());
  }

  public expandFAPayment() {
    cy.get('button[class="v-icon notranslate v-data-table__expand-icon v-icon--link mdi mdi-menu-down theme--light"]').click();
  }

  public getFAPaymentGroupTitle() {
    return cy.getByDataTest(this.groupTitle).invoke('text').then((text) => text.trim());
  }

  public getFAPaymentGroupTotal() {
    return cy.getByDataTest(this.groupTotal).invoke('text').then((text) => text.trim());
  }

  public getFAPaymentPaymentStatus() {
    return cy.getByDataTest(this.groupPaymentStatus).invoke('text').then((text) => text.trim());
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileDetails).click();
    return new CaseFileDetailsPage();
  }
}
