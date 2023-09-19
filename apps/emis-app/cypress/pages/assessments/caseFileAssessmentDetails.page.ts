export enum DataTest {
  answerHistoryButton = 'answer-history-open-button',
  answerHistoryResponseLog = 'history-response',
  answerHistoryResponseValue = 'history-answer',
  dateAssigned = 'date_assigned',
  completedBy = 'completed_by',
  dateCompleted = 'date_completed',
  questionFirst = 'question_item__0',
  questionSecond = 'question_item__1',
  responseFirst = 'answer_item__0',
  responseSecond = 'answer_item__1',
  assessmentStatus = 'chip-text',
  backToAssessmentButton = 'details_back_btn',
}

export class CaseFileAssessmentDetailsPage {
  private answerHistoryButton = { selector: DataTest.answerHistoryButton };

  private answerHistoryResponseLog = { selector: DataTest.answerHistoryResponseLog };

  private answerHistoryResponseValue = { selector: DataTest.answerHistoryResponseValue };

  private dateAssigned = { selector: DataTest.dateAssigned };

  private completedBy = { selector: DataTest.completedBy };

  private dateCompleted = { selector: DataTest.dateCompleted };

  private questionFirst = { selector: DataTest.questionFirst };

  private questionSecond = { selector: DataTest.questionSecond };

  private responseFirst = { selector: DataTest.responseFirst };

  private responseSecond = { selector: DataTest.responseSecond };

  private assessmentStatus = { selector: DataTest.assessmentStatus };

  private backToAssessmentButton = { selector: DataTest.backToAssessmentButton };

  public getAnswerHistoryButton() {
    return cy.getByDataTest(this.answerHistoryButton);
  }

  public getDialogAnswerHistoryResponseLogByIndex(index: number) {
    return cy.getByDataTestLike(this.answerHistoryResponseLog).eq(index);
  }

  public getDialogAnswerHistoryResponseValueByIndex(index: number) {
    return cy.getByDataTestLike(this.answerHistoryResponseValue).eq(index).invoke('text').then((text) => text.trim().toLowerCase());
  }

  public getAssessmentDateAssigned() {
    return cy.getByDataTestLike(this.dateAssigned).getAndTrimText();
  }

  public getAssessmentCompletedBy() {
    return cy.getByDataTestLike(this.completedBy).getAndTrimText();
  }

  public getAssessmentDateCompleted() {
    return cy.getByDataTestLike(this.dateCompleted).getAndTrimText();
  }

  public getAssessmentStatus() {
    return cy.getByDataTestLike(this.assessmentStatus).getAndTrimText();
  }

  public getAssessmentFirstQuestion() {
    return cy.getByDataTestLike(this.questionFirst).getAndTrimText();
  }

  public getAssessmentFirstResponse() {
    return cy.getByDataTestLike(this.responseFirst).getAndTrimText();
  }

  public getAssessmentSecondQuestion() {
    return cy.getByDataTestLike(this.questionSecond).getAndTrimText();
  }

  public getAssessmentSecondResponse() {
    return cy.getByDataTestLike(this.responseSecond).getAndTrimText();
  }

  public getBackToAssessmentButton() {
    return cy.getByDataTestLike(this.backToAssessmentButton);
  }
}
