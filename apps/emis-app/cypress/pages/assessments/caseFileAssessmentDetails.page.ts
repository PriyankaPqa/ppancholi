export enum DataTest {
  answerHistoryButton = 'answer-history-open-button',
  answerHistoryResponseLog = 'history-response',
  answerHistoryResponseValue = 'history-answer',
}

export class CaseFileAssessmentDetailsPage {
  private answerHistoryButton = { selector: DataTest.answerHistoryButton };

  private answerHistoryResponseLog = { selector: DataTest.answerHistoryResponseLog };

  private answerHistoryResponseValue = { selector: DataTest.answerHistoryResponseValue };

  public getAnswerHistoryButton() {
    return cy.getByDataTest(this.answerHistoryButton);
  }

  public getDialogAnswerHistoryResponseLogByIndex(index: number) {
    return cy.getByDataTestLike(this.answerHistoryResponseLog).eq(index);
  }

  public getDialogAnswerHistoryResponseValueByIndex(index: number) {
    return cy.getByDataTestLike(this.answerHistoryResponseValue).eq(index).invoke('text').then((text) => text.trim().toLowerCase());
  }
}
