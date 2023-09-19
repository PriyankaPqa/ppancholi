import { IMultilingual } from '@libs/shared-lib/types';
import { ProgramDetailsPage } from './programDetails.page';

export enum DataTest {
  programName = 'program-name',
  statusName = 'program-status-name',
  statusToggle = 'program-status-toggle',
  paymentModalities = 'payment-modalities',
  approvalRequired = 'program-approvalRequired',
  programDescription = 'program-description',
  programCreate = 'save',
  frenchTab = 'tab-lang-fr',
  eligibilityCriteriaAuthenticated = 'program-eligibility-authenticated',
}

export interface IAddNewProgramFields {
  name: IMultilingual,
  description: IMultilingual,
  paymentModalityIndexes: number[],
}

export class AddNewEventProgramPage {
  private programName = { selector: DataTest.programName, type: 'input' };

  private statusToggle = { selector: DataTest.statusToggle };

  private statusName = { selector: DataTest.statusName };

  private programDescription = { selector: DataTest.programDescription, type: 'textarea' };

  private frenchTab = { selector: DataTest.frenchTab };

  private programCreate = { selector: DataTest.programCreate };

  private approvalRequired = { selector: DataTest.approvalRequired };

  private eligibilityCriteriaAuthenticated = { selector: DataTest.eligibilityCriteriaAuthenticated };

  async fill(data: IAddNewProgramFields) {
    if (data.name) {
      cy.getByDataTest(this.programName).type(data.name.translation.en);
    }

    if (data.paymentModalityIndexes) {
      cy.selectMultipleElementByIndex(DataTest.paymentModalities, data.paymentModalityIndexes);
    }

    if (data.description) {
      cy.getByDataTest(this.programDescription).type(data.description.translation.en);
    }
  }

  public toggleStatus() {
    cy.getByDataTest(this.statusToggle).click({ force: true });
  }

  public getStatusName() {
    return cy.getByDataTest(this.statusName).getAndTrimText();
  }

  public selectFrenchTab() {
    cy.getByDataTest(this.frenchTab).click();
  }

  public fillFrenchData(data: IAddNewProgramFields) {
    if (data.name.translation.fr) {
      cy.getByDataTest(this.programName).clear().type(data.name.translation.fr);
    }
    if (data.description.translation.fr) {
      cy.getByDataTest(this.programDescription).clear().type(data.description.translation.fr);
    }
  }

  public getProgramCreateButton() {
    return cy.getByDataTest(this.programCreate);
  }

  public uncheckApprovalRequiredCheckbox() {
    return cy.getByDataTest(this.approvalRequired).uncheck({ force: true });
  }

  public getApprovalRequiredCheckbox() {
    return cy.getByDataTest(this.approvalRequired);
  }

  public createProgram() {
    cy.getByDataTest(this.programCreate).click();
    return new ProgramDetailsPage();
  }
}
