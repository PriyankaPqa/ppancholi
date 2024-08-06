import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  event = 'event',
  assessment = 'assessment',
  emailSubject = 'emailSubject',
  contentBeforeLink = 'emailTopCustomContent',
  contentAfterLink = 'emailAdditionalDescription',
}

export class MassAssessmentsDetailsPage extends BaseDetailsMassAction {
  private event = { selector: DataTest.event };

  private assessment = { selector: DataTest.assessment };

  private emailSubject = { selector: DataTest.emailSubject };

  private contentBeforeLink = { selector: DataTest.contentBeforeLink };

  private contentAfterLink = { selector: DataTest.contentAfterLink };

  public getMassAssessmentEvent() {
    return cy.getByDataTest(this.event).getAndTrimText();
  }

  public getMassAssessmentName() {
    return cy.getByDataTest(this.assessment).getAndTrimText();
  }

  public getEmailSubject() {
    return cy.getByDataTest(this.emailSubject).getAndTrimText();
  }

  public getContentBeforeLink() {
    return cy.getByDataTest(this.contentBeforeLink).getAndTrimText();
  }

  public getContentAfterLink() {
    return cy.getByDataTest(this.contentAfterLink).getAndTrimText();
  }
}
