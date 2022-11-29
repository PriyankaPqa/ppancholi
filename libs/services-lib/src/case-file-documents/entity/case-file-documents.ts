import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { ICaseFileDocumentEntity, ICaseFileDocumentMetadata } from '@libs/entities-lib/case-file-document';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ICaseFileDocumentsService } from './case-file-documents.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const ENTITY = 'documents';
interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseFileDocumentsService extends DomainBaseService<ICaseFileDocumentEntity, UrlParams>
  implements ICaseFileDocumentsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async updateDocument(item: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity> {
    return this.http.patch<ICaseFileDocumentEntity>(this.getItemUrl(`${this.baseUrl}/{id}/edit`, item), item);
  }

  async downloadDocumentAsUrl(item: ICaseFileDocumentEntity, saveDownloadedFile: boolean) {
    return this.http.getFullResponse<BlobPart>(this.getItemUrl(`${this.baseUrl}/{id}/file`, item), { responseType: 'blob' }).then(
      (response) => this.http.getRestResponseAsFile(response, saveDownloadedFile, item.originalFilename),
    );
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<ICaseFileDocumentEntity, ICaseFileDocumentMetadata>> {
    return this.http.get(`case-file/search/${searchEndpoint ?? 'documents'}`, { params, isOData: true });
  }
}
