import { TenantSettingsEntity } from './tenantSettings';
import { mockTenantSettingsEntityData } from './tenantSettings.mock';

const mock = mockTenantSettingsEntityData();

describe('>>> TenantSettingsEntity', () => {
  describe('>> constructor', () => {
    describe('if data is passed', () => {
      it('should instantiate slug', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.slug).toBe(mock.slug);
      });

      it('should instantiate emisDomain', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.emisDomain).toEqual(mock.emisDomain);
      });

      it('should instantiate registrationDomain', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.registrationDomain).toEqual(mock.registrationDomain);
      });

      it('should instantiate availableLanguages', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.availableLanguages).toEqual(mock.availableLanguages);
      });

      it('should instantiate features', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.features).toEqual(mock.features);
      });

      it('should instantiate branding', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.branding).toEqual({ ...mock.branding, showName: !mock.branding.hideName });
      });
    });

    describe('if data is not passed', () => {
      it('should instantiate slug', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.slug).toEqual('');
      });

      it('should instantiate emisDomain', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.emisDomain).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });

      it('should instantiate registrationDomain', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.registrationDomain).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });

      it('should instantiate availableLanguages', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.availableLanguages).toEqual([]);
      });

      it('should instantiate features', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.features).toEqual([]);
      });

      it('should not instantiate branding', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.branding).toBeUndefined();
      });
    });
  });
});
