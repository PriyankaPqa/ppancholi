import { ApprovalTableHomePage } from './approvalTableHome.page';

export enum DataTest {
programSelect = 'approvals__programSelect',
tableName = 'approval-template-name',
approvalStatus = 'approval-status',
financialAssistance = 'total_financialAssistance',
approvalGroupAdd = 'approvals_groupTable_addGroupRow',
approvalGroupTable = 'approvals_groupTable_row',
userRole = 'user_roleId',
minimumValue = 'approvals_item0__minimum',
maximumValue = 'approvals_item0__maximum',
approvalGroupSave = 'approvals_groupTable_add',
approvalGroupEdit = 'approvals_groupTable_edit',
approvalGroupDelete = 'approvals_groupTable_delete',
approvalTableCreate = 'approval-saveBtn',
}

export interface IApprovalTableData {
  tableName?: string;
  statusIndicator?: string;
  userRole?: string;
  minimumAmount?: string;
  maximumAmount?: string;
}

export class CreateApprovalTablePage {
  private programSelect = { selector: DataTest.programSelect, type: 'input' };

  private tableName = { selector: DataTest.tableName, type: 'input' };

  private approvalStatus = { selector: DataTest.approvalStatus };

  private financialAssistance = { selector: DataTest.financialAssistance, type: 'input' };

  private approvalGroupAdd = { selector: DataTest.approvalGroupAdd };

  private approvalGroupTable = { selector: DataTest.approvalGroupTable };

  private userRole = { selector: DataTest.userRole };

  private minimumValueLabel = { selector: DataTest.minimumValue };

  private minimumValue = { selector: DataTest.minimumValue, type: 'input' };

  private maximumValueLabel = { selector: DataTest.maximumValue };

  private maximumValue = { selector: DataTest.maximumValue, type: 'input' };

  private approvalGroupSave = { selector: DataTest.approvalGroupSave };

  private approvalGroupEdit = { selector: DataTest.approvalGroupEdit };

  private approvalGroupDelete = { selector: DataTest.approvalGroupDelete };

  private approvalTableCreate = { selector: DataTest.approvalTableCreate };

  public getApprovalTableStatus() {
    return cy.getByDataTest(this.approvalStatus).invoke('text').then((text) => text.trim());
  }

  public fillTableName(tableName: string) {
    cy.getByDataTest(this.tableName).type(tableName);
  }

  public selectProgram(programName: string) {
    cy.searchAndSelect(DataTest.programSelect, programName);
  }

  public selectApprovalAggregatedBy() {
    cy.getByDataTest(this.financialAssistance).click({ force: true });
  }

  public addApprovalGroup() {
    cy.getByDataTest(this.approvalGroupAdd).click();
  }

  public getApprovalGroupTable() {
    return cy.getByDataTest(this.approvalGroupTable);
  }

  public getUserRoleField() {
    return cy.getByDataTest(this.userRole);
  }

  public selectUserRole(roleName: string) {
    return cy.selectListElementByValue(DataTest.userRole, roleName);
  }

  public getMinimumValueField() {
    return cy.getByDataTest(this.minimumValue);
  }

  public getMaximumValueField() {
    return cy.getByDataTest(this.maximumValue);
  }

  public getMinimumValueLabel() {
    return cy.getByDataTest(this.minimumValueLabel);
  }

  public getMaximumValueLabel() {
    return cy.getByDataTest(this.maximumValueLabel);
  }

  public saveApprovalGroup() {
    return cy.getByDataTest(this.approvalGroupSave).click();
  }

  public getDeleteApprovalGroupButton() {
    return cy.getByDataTest(this.approvalGroupDelete);
  }

  public getEditApprovalGroupButton() {
    return cy.getByDataTest(this.approvalGroupEdit);
  }

  public getCreateApprovalTableButton() {
    return cy.getByDataTest(this.approvalTableCreate);
  }

  public createApprovalTable() {
    cy.getByDataTest(this.approvalTableCreate).click();
    return new ApprovalTableHomePage();
  }
}
