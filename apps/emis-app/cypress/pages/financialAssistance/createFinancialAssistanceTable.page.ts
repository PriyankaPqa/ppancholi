import { IMultilingual } from '@libs/shared-lib/types';

export enum DataTest {
  tableName = 'financial-assistance-name',
  associateProgram = 'financialCreate__programSelect',
  status = 'financial-assistance-table-status',
  statusToggle = 'financial-assistance-table-status-toggle',
  createTable = 'financial-assistance-saveBtn',
  addItem = 'financialAssistanceItems__addItem',
  addItemConfirm = 'financialAssistanceItems__confirmAddItemBtn',
  addItemCancelButton = 'financialAssistanceItems__cancelAddItemBtn',
  itemDispayed = 'financialAssistanceItems_item__0__mainCategory',
  subItemAdd = 'financialAssistanceItems__addSubItem',
  subItemSelect = 'financialAssistanceItems__addSubItemSelect',
  subItemMax = 'financialAssistanceItems__addSubItemMaximum',
  subItemFrequency = 'financialAssistanceItems__addSubItemFrequency',
  subItemCategoryDisplay = 'financialAssistanceItems__subItem__0__0__subCategory',
  subItemMaxAmountDisplay = 'financialAssistanceItems__subItem__0__0__maximumAmount',
  subItemFrequencyDisplay = 'financialAssistanceItems__subItem__0__0__frequency',
  subItemAmountType = 'financialAssistanceItems__subItem__0__0__amountType',
  subItemDocsRequired = 'financialAssistanceItems__subItem__0__0__documentationRequired',
  subItemConfirmAdd = 'financialAssistanceItems__confirmAddSubItemBtn',
  frenchTab = 'financialCreate__lang--fr',
  itemSelect = 'financialAssistanceItems__addItemSelect',
  itemEdit = 'financialAssistanceItems__editItemBtn',
  subItemEdit = 'financialAssistanceItems__editSubItemBtn--0--0',
  itemDelete = 'financialAssistanceItems__deleteItemBtn',
  subItemDelete = 'financialAssistanceItems__deleteSubItemBtn--0--0',
}

export interface IFinancialAssistanceTableData {
  name?: IMultilingual;
  itemType?: string;
  subItem?: IFinancialAssistanceSubItemData;
}

export interface IFinancialAssistanceSubItemData {
  type?: string;
  maxAmount?: string;
  frequency?: string;
}
export class CreateFinancialAssistanceTablePage {
  private tableName = { selector: DataTest.tableName, type: 'input' };

  private associateProgram = { selector: DataTest.associateProgram, type: 'input' };

  private status = { selector: DataTest.status };

  private statusToggle = { selector: DataTest.statusToggle, type: 'input' };

  private addItemButton = { selector: DataTest.addItem };

  private itemEdit = { selector: DataTest.itemEdit };

  private itemDispayed = { selector: DataTest.itemDispayed };

  private subItemCategoryDisplay = { selector: DataTest.subItemCategoryDisplay };

  private subItemMaxAmountDisplay = { selector: DataTest.subItemMaxAmountDisplay };

  private subItemFrequencyDisplay = { selector: DataTest.subItemFrequencyDisplay };

  private subItemAmountTypeDisplay = { selector: DataTest.subItemAmountType };

  private subItemDocsRequiredDisplay = { selector: DataTest.subItemDocsRequired };

  private subItemAdd = { selector: DataTest.subItemAdd };

  private subItemConfirmAdd = { selector: DataTest.subItemConfirmAdd };

  private subItemEdit = { selector: DataTest.subItemEdit };

  private itemDelete = { selector: DataTest.itemDelete };

  private subItemDelete = { selector: DataTest.subItemDelete };

  private addItemConfirm = { selector: DataTest.addItemConfirm };

  private createTable = { selector: DataTest.createTable };

  private frenchTab = { selector: DataTest.frenchTab };

  private subItemMax = { selector: DataTest.subItemMax, type: 'input' };

  public fillTableName(tableName: string) {
    cy.getByDataTest(this.tableName).type(tableName);
  }

  public selectProgram(programName: string) {
    cy.searchAndSelect(DataTest.associateProgram, programName);
  }

  public getTableStatus() {
    return cy.getByDataTest(this.status).getAndTrimText();
  }

  public selectFrenchTab() {
    cy.getByDataTest(this.frenchTab).click();
  }

  public addItem() {
    cy.getByDataTest(this.addItemButton).click();
  }

  public confirmAddItem() {
    cy.getByDataTest(this.addItemConfirm).click();
  }

  public getItemType() {
    return cy.getByDataTestLike(this.itemDispayed).getAndTrimText();
  }

  public getSubItemCategory() {
    return cy.getByDataTestLike(this.subItemCategoryDisplay).getAndTrimText();
  }

  public getSubItemMaxAmount() {
    return cy.getByDataTestLike(this.subItemMaxAmountDisplay).getAndTrimText();
  }

  public getSubItemFrequency() {
    return cy.getByDataTestLike(this.subItemFrequencyDisplay).getAndTrimText();
  }

  public getSubItemAmountType() {
    return cy.getByDataTestLike(this.subItemAmountTypeDisplay).getAndTrimText();
  }

  public getSubItemDocsRequired() {
    return cy.getByDataTestLike(this.subItemDocsRequiredDisplay).getAndTrimText();
  }

  public toggleStatus() {
    cy.getByDataTest(this.statusToggle).check({ force: true });
  }

  public chooseItemType(item: string) {
    cy.selectListElementByValue(DataTest.itemSelect, item);
  }

  public getItemEditButton() {
    return cy.getByDataTestLike(this.itemEdit);
  }

  public getItemDeleteButton() {
    return cy.getByDataTestLike(this.itemDelete);
  }

  public addSubItem() {
    cy.getByDataTestLike(this.subItemAdd).click();
  }

  async fillSubItemData(subItem: IFinancialAssistanceSubItemData) {
      if (subItem.type) {
        cy.selectListElementByValue(DataTest.subItemSelect, subItem.type);
      }
      if (subItem.maxAmount) {
        cy.getByDataTest(this.subItemMax).clear().type(subItem.maxAmount);
      }

      if (subItem.frequency) {
        cy.selectListElementByValue(DataTest.subItemFrequency, subItem.frequency);
      }
  }

  public confirmSubItemAdd() {
    cy.getByDataTest(this.subItemConfirmAdd).click();
  }

  public getSubItemEditButton() {
    return cy.getByDataTestLike(this.subItemEdit);
  }

  public getSubItemDeleteButton() {
    return cy.getByDataTestLike(this.subItemDelete);
  }

  public fillFrenchTableName(tableName: string) {
    cy.getByDataTest(this.tableName).clear().type(tableName);
  }

  public addFinancialAssistanceTable() {
    cy.getByDataTest(this.createTable).click();
  }
}
