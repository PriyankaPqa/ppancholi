import { TeamTaskDetailsPage } from './teamTaskDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  taskSubCategory = 'task-sub-category',
  saveButton = 'save-button',
}

export class EditTeamTaskPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private taskSubCategory = { selector: DataTest.taskSubCategory };

  private buttonSave = { selector: DataTest.saveButton };

    public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getTaskSubCategoryElement() {
    return cy.getByDataTest(this.taskSubCategory);
  }

  public selectTaskSubCategory(subCategory: string) {
    return cy.selectListElementByValue(DataTest.taskSubCategory, subCategory);
  }

  public saveEditedTeamTask() {
    cy.getByDataTest(this.buttonSave).click();
    return new TeamTaskDetailsPage();
  }
}
