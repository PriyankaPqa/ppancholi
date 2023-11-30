import { FeatureEntity } from './feature';
import { TenantSettingsEntity } from './tenantSettings';
import { mockFeatures, mockTenantSettingsEntityData } from './tenantSettings.mock';
import { FeatureType, FeatureVisibility } from './tenantSettings.types';

const mock = mockTenantSettingsEntityData();
const mockFeature = mockFeatures()[0];

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

      it('should instantiate consentStatements', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.consentStatements).toEqual(mock.consentStatements);
      });

      it('should instantiate branding', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.branding).toEqual({ ...mock.branding, showName: !mock.branding.hideName });
      });

      it('should instantiate supportEmails', () => {
        const entity = new TenantSettingsEntity(mock);
        expect(entity.supportEmails).toEqual(mock.supportEmails);
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

      it('should instantiate consentStatements', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.consentStatements).toEqual([]);
      });

      it('should not instantiate branding', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.branding).toBeUndefined();
      });

      it('should instantiate supportEmails', () => {
        const entity = new TenantSettingsEntity();
        expect(entity.supportEmails).toEqual({
          translation: {
            en: '',
            fr: '',
          },
        });
      });
    });
  });
});

describe('>>> FeatureEntity', () => {
  describe('>> constructor', () => {
    describe('if data is passed', () => {
      const feature = new FeatureEntity(mockFeature);
      it('should instantiate name', () => {
        expect(feature.name).toEqual(mockFeature.name);
      });
      it('should instantiate description', () => {
        expect(feature.description).toEqual(mockFeature.description);
      });
      it('should instantiate key', () => {
        expect(feature.key).toEqual(mockFeature.key);
      });
      it('should instantiate enabled', () => {
        expect(feature.enabled).toEqual(mockFeature.enabled);
      });
      it('should instantiate canEnable', () => {
        expect(feature.canEnable).toEqual(mockFeature.canEnable);
      });
      it('should instantiate canDisable', () => {
        expect(feature.canDisable).toEqual(mockFeature.canDisable);
      });
      it('should instantiate type', () => {
        expect(feature.type).toEqual(mockFeature.type);
      });
      it('should instantiate visibility', () => {
        expect(feature.visibility).toEqual(mockFeature.visibility);
      });
    });
    describe('if data is not passed', () => {
      const feature = new FeatureEntity();
      const emptyMultilingual = {
        translation: {
          en: '',
          fr: '',
        },
      };
      it('should instantiate name', () => {
        expect(feature.name).toEqual(emptyMultilingual);
      });
      it('should instantiate description', () => {
        expect(feature.description).toEqual(emptyMultilingual);
      });
      it('should instantiate key as empty string', () => {
        expect(feature.key).toEqual('');
      });
      it('should instantiate enabled as false', () => {
        expect(feature.enabled).toEqual(false);
      });
      it('should instantiate canEnable as false', () => {
        expect(feature.canEnable).toEqual(false);
      });
      it('should instantiate canDisable as false', () => {
        expect(feature.canDisable).toEqual(false);
      });
      it('should instantiate type as temporary', () => {
        expect(feature.type).toEqual(FeatureType.Temporary);
      });
      it('should instantiate visibility as private', () => {
        expect(feature.visibility).toEqual(FeatureVisibility.Private);
      });
    });
  });
});
