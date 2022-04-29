import { IHttpClient } from '@libs/core-lib/services/http-client';
import { DomainBaseService } from '@libs/core-lib/services/base';
import { ICaseFileDocumentEntity, ICaseFileDocumentMetadata } from '@/entities/case-file-document';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/core-lib/types';
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
      (response) => {
        const blob = response.headers && response.headers['content-type']
          ? new Blob([response.data], { type: response.headers['content-type'] }) : new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        if (saveDownloadedFile) {
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', item.originalFilename);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        return url;
      },
    );
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<ICaseFileDocumentEntity, ICaseFileDocumentMetadata>> {
    return this.http.get(`case-file/search/${searchEndpoint ?? 'documents'}`, { params, isOData: true });
  }
}
