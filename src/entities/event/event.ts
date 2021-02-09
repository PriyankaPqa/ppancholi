import { IMultilingual } from '@/types';
import utils from '@/entities/utils';

import { IEvent, IEventData } from './event.types';

export class Event implements IEvent {
  id: string;

  assistanceNumber: string;

  name: IMultilingual;

  description: IMultilingual;

  registrationLink: IMultilingual;

  constructor(data?: IEventData) {
    if (data) {
      this.id = data.id;
      this.assistanceNumber = data.assistanceNumber;
      this.name = {
        translation: {
          ...data.name.translation,
        },
      };
      this.description = {
        translation: {
          ...data.description.translation,
        },
      };
      this.registrationLink = {
        translation: {
          ...data.registrationLink.translation,
        },
      };
    } else {
      this.reset();
    }
  }

  private reset() {
    this.name = utils.initMultilingualAttributes();
    this.description = utils.initMultilingualAttributes();
    this.registrationLink = utils.initMultilingualAttributes();
  }

  public fillEmptyMultilingualAttributes() {
    this.name = utils.getFilledMultilingualField(this.name);
    this.description = utils.getFilledMultilingualField(this.description);
    this.registrationLink = utils.getFilledMultilingualField(this.registrationLink);
  }
}
