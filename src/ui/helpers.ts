import { i18n } from '@/ui/plugins/i18n';

export default {
  // Method to format the backend error messages and display in a toast.
  formatErrorMessages(errorDetailsList: Array<Record<string, unknown>>, errorStatusCode: number) {
    const errorMessageList = errorDetailsList.map((errorDetail) => i18n.t(`error.${errorDetail.messageKey}`, {
      x: errorStatusCode,
      y: errorDetail.errorCode,
    }));
    return errorMessageList.join('</br>');
  },

  // Method to open a window on the right side of the screen
  openWindowRightSide(url: string, width: number) {
    const popupWidth = width;
    const leftPos = window.innerWidth - popupWidth;
    window.open(
      url,
      'helpCenter',
      `directories=no, titlebar=no, toolbar=no, location=no, status=no,
      menubar=no, scrollbars=yes, resizable=yes ,width=${popupWidth}, height=1040, top=0, left=${leftPos}`,
    );
  },
};
