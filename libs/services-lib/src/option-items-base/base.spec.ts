import { mockOptionItemData, mockSubItem } from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';
import { mockHttp } from '../http-client';
import { OptionItemBaseService } from './base';

const http = mockHttp();

const API_URL_SUFFIX = 'API_URL_SUFFIX';
const CONTROLLER = 'CONTROLLER';

describe('>>> Option Item Base Service', () => {
  const service = new OptionItemBaseService(http as never, API_URL_SUFFIX, CONTROLLER);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOptionItem', () => {
    it('should call the proper endpoint', async () => {
      const mock = mockOptionItemData()[0];

      await service.createOptionItem(mock);

      expect(http.post).toHaveBeenCalledWith(`${service.baseUrl}`, mock);
    });
  });

  describe('addSubItem', () => {
    it('should call the proper endpoint', async () => {
      const itemId = '1';
      const subItem = mockSubItem();

      await service.addSubItem(itemId, subItem);

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${itemId}/add-subitem`, subItem);
    });
  });

  describe('updateOptionItem', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';
      const name = {
        translation: {
          en: 'Flood',
          fr: 'Inundation',
        },
      };
      const description = {
        translation: {
          en: 'This is item 1 description',
          fr: 'This is item 1 description FR',
        },
      };

      await service.updateOptionItem(id, name, description);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/name-description`, { name, description });
    });
  });

  describe('updateOptionSubItem', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';
      const subItemId = '1';
      const name = {
        translation: {
          en: 'Flood',
          fr: 'Inundation',
        },
      };
      const description = {
        translation: {
          en: 'This is item 1 description',
          fr: 'This is item 1 description FR',
        },
      };

      await service.updateOptionSubItem(id, subItemId, name, description);
      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/subitem/${subItemId}/name-description`, { name, description });
    });
  });

  describe('updateOptionItemStatus', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';

      await service.updateOptionItemStatus(id, Status.Active);

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/status`, { status: Status.Active });
    });
  });

  describe('updateOptionSubItemStatus', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';
      const subItemId = '2';
      const status = Status.Active;

      await service.updateOptionSubItemStatus(id, subItemId, status);

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/subitem/${subItemId}/status`, { status });
    });
  });

  describe('updateOptionItemOrderRanks', () => {
    it('should call the proper endpoint', async () => {
      await service.updateOptionItemOrderRanks({});

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/order-ranks`, { reOrders: {} });
    });
  });

  describe('updateOptionSubItemOrderRanks', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';
      await service.updateOptionSubItemOrderRanks(id, {});

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/subitem/order-ranks`, { reOrders: {} });
    });
  });

  describe('setOptionItemIsOther', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';
      await service.setOptionItemIsOther(id, true);

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/is-other`, { isOther: true });
    });
  });

  describe('setOptionItemIsDefault', () => {
    it('should call the proper endpoint', async () => {
      const id = '1';
      await service.setOptionItemIsDefault(id, true);

      expect(http.patch).toHaveBeenCalledWith(`${service.baseUrl}/${id}/is-default`, { isDefault: true });
    });
  });
});
