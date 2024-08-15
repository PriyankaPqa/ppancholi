export enum DataTest {
  dialogTitle = 'dialog-title',
  historyTable = 'history-table_inner',
  historyTableEditedBy = 'history_table_edited_by',
  historyTableActionTaken = 'history_table_action_taken',
  historyTableChangeDate = 'history_table_change_date',
  historyTableRationale = 'history_table_rationale',
  buttonClose = 'dialog-cancel-action',
}

export class TasksHistoryPage {
  private dialogTitle = { selector: DataTest.dialogTitle };

  private historyTable = { selector: DataTest.historyTable };

  private buttonClose = { selector: DataTest.buttonClose };

  private historyTableEditedBy = { selector: DataTest.historyTableEditedBy };

  private historyTableActionTaken = { selector: DataTest.historyTableActionTaken };

  private historyTableChangeDate = { selector: DataTest.historyTableChangeDate };

  private historyTableRationale = { selector: DataTest.historyTableRationale };

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getHistoryTableEditedByElement() {
    return cy.getByDataTest(this.historyTableEditedBy);
  }

  public getHistoryTableActionTaken() {
    return cy.getByDataTest(this.historyTableActionTaken).getAndTrimText();
  }

  public getHistoryTableDateOfChange() {
    return cy.getByDataTest(this.historyTableChangeDate).getAndTrimText();
  }

  public getHistoryTableRationale() {
    return cy.getByDataTest(this.historyTableRationale).getAndTrimText();
  }

  public getHistoryTable() {
    return cy.getByDataTest(this.historyTable);
  }

  public getCloseButton() {
    return cy.getByDataTest(this.buttonClose);
  }
}
