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

  public getHistoryTableEditedByElementByIndex(index = 0) {
    return cy.getByDataTest(this.historyTableEditedBy).eq(index);
  }

  public getHistoryTableActionTakenByIndex(index = 0) {
    return cy.getByDataTest(this.historyTableActionTaken).eq(index).getAndTrimText();
  }

  public getHistoryTableDateOfChangeByIndex(index = 0) {
    return cy.getByDataTest(this.historyTableChangeDate).eq(index).getAndTrimText();
  }

  public getHistoryTableRationaleByIndex(index = 0) {
    return cy.getByDataTest(this.historyTableRationale).eq(index).getAndTrimText();
  }

  public getHistoryTable() {
    return cy.getByDataTest(this.historyTable);
  }

  public getCloseButton() {
    return cy.getByDataTest(this.buttonClose);
  }
}
