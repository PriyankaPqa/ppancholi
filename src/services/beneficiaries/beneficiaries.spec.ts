import { mockHttp } from '@/services/httpClient.mock';
import { IAzureSearchParams } from '@/types';
import { BeneficiariesService } from './beneficiaries';

const http = mockHttp();

describe('>>> Beneficiaries Service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  const service = new BeneficiariesService(http as never);

  test('getGenders is linked to the correct URL', async () => {
    await service.getGenders();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/genders');
  });

  test('getPreferredLanguages is linked to the correct URL', async () => {
    await service.getPreferredLanguages();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/preferred-languages');
  });

  test('getPrimarySpokenLanguages is linked to the correct URL', async () => {
    await service.getPrimarySpokenLanguages();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/primary-spoken-languages');
  });

  test('searchIndigenousIdentities is linked to the correct URL', async () => {
    const params: IAzureSearchParams = {
      filter: {
        provinceTerritory: 13,
      },
    };

    await service.searchIndigenousIdentities(params);
    expect(http.get).toHaveBeenCalledWith('/public-search/indigenous-identities', { params, isOData: true });
  });
});
