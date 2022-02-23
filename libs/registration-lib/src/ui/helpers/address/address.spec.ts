import helpers from '../index';
import { mockAddress } from '../../../entities/value-objects/address';
import { ECanadaProvinces } from '../../../types';

describe('provinceCode', () => {
  it('should return the correct province for Canada with a regular province', () => {
    const address = mockAddress();
    expect(helpers.provinceCode(address)).toEqual('ON');
  });

  it('should return the correct province for Canada for custom province', () => {
    const address = mockAddress({
      province: ECanadaProvinces.OT,
      specifiedOtherProvince: 'otherProvince',
    });
    expect(helpers.provinceCode(address)).toEqual('otherProvince');
  });

  it('should return the correct province for other countries', () => {
    const address = mockAddress({
      province: null,
      specifiedOtherProvince: 'IDF',
    });
    expect(helpers.provinceCode(address)).toEqual('IDF');
  });
});

describe('getAddressLines', () => {
  it('should return proper array', () => {
    const address = mockAddress();
    // eslint-disable-next-line
    expect(helpers.getAddressLines(address, { locale: 'en' } as any)).toEqual(['247 Some Street', 'Ottawa, ON, K1W 1G7', 'Canada']);
  });
});
