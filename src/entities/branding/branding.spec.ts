/**
 * @group entities
 */

import { BrandingEntity } from './branding';
import { mockBrandingEntityData } from './branding.mock';

const mock = mockBrandingEntityData();

describe('>>> BrandingEntity', () => {
  describe('>> constructor', () => {
    describe('if data is passed', () => {
      it('should instantiate colours', () => {
        const entity = new BrandingEntity(mock);
        expect(entity.colours).toBe(mock.colours);
      });

      it('should instantiate name', () => {
        const entity = new BrandingEntity(mock);
        expect(entity.name).toBe(mock.name);
      });

      it('should instantiate description', () => {
        const entity = new BrandingEntity(mock);
        expect(entity.description).toBe(mock.description);
      });

      it('should instantiate hideName', () => {
        const entity = new BrandingEntity(mock);
        expect(entity.showName).toBe(!mock.hideName);
      });
    });

    describe('if not data is passed', () => {
      it('should instantiate showName', () => {
        const entity = new BrandingEntity();
        expect(entity.showName).toBe(true);
      });
    });
  });
});
