import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  titlePage = 'page-title',
  iconText = 'chip-text',
  editDocument = 'editDocument-link',
  deleteDocument = 'deleteDocument-link',
  linkOpen = 'open-link',
  linkDownload = 'download-link',
  fileName = 'file-name',
  documentCategory = 'document_details_category',
  documentDate = 'document_details_method',
  documentNotes = 'document_details_notes',
  backToDocuments = 'document_details_back_btn',
  caseFileActivityTab = 'case-file-activity',
}

export class DocumentDetailsPage {
  private titlePage = { selector: DataTest.titlePage };

  private iconText = { selector: DataTest.iconText };

  private editDocument = { selector: DataTest.editDocument };

  private deleteDocument = { selector: DataTest.deleteDocument };

  private linkOpen = { selector: DataTest.linkOpen };

  private linkDownload = { selector: DataTest.linkDownload };

  private documentCategory = { selector: DataTest.documentCategory };

  private documentDate = { selector: DataTest.documentDate };

  private documentNotes = { selector: DataTest.documentNotes };

  private backToDocuments = { selector: DataTest.backToDocuments };

  private caseFileActivityTab = { selector: DataTest.caseFileActivityTab };

  private fileName = { selector: DataTest.fileName };

  public getPageTitle() {
    return cy.getByDataTest(this.titlePage);
  }

  public getIconText() {
    return cy.getByDataTest(this.iconText).getAndTrimText();
  }

  public getEditDocumentButton() {
    return cy.getByDataTest(this.editDocument);
  }

  public getDeleteDocumentButton() {
    return cy.getByDataTest(this.deleteDocument);
  }

  public getOpenDocumentLink() {
    return cy.getByDataTest(this.linkOpen);
  }

  public getDownloadDocumentLink() {
    return cy.getByDataTest(this.linkDownload);
  }

  public getFileName() {
    return cy.getByDataTest(this.fileName).getAndTrimText();
  }

  public getDocumentCategory() {
    return cy.getByDataTest(this.documentCategory).getAndTrimText();
  }

  public getDocumentAddedDate() {
    return cy.getByDataTest(this.documentDate).getAndTrimText();
  }

  public getDocumentNotes() {
    return cy.getByDataTest(this.documentNotes).getAndTrimText();
  }

  public getBackToDocumentsButton() {
    return cy.getByDataTest(this.backToDocuments);
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileActivityTab).click();
    return new CaseFileDetailsPage();
  }
}
