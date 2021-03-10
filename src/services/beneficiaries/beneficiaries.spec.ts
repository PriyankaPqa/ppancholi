import { mockHttp } from '@/services/httpClient.mock';
import { BeneficiariesService } from './beneficiaries';

const http = mockHttp();

describe('>>> Beneficiaries Service', () => {
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

  test('getIndigenousTypes is linked to the correct URL', async () => {
    await service.getIndigenousTypes();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/indigenous-types');
  });

  test('getIndigenousCommunities is linked to the correct URL', async () => {
    await service.getIndigenousCommunities();
    expect(http.get).toHaveBeenCalledWith('/beneficiary/indigenous-communities');
  });
});
