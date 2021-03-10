export default {
  scrollToFirstErrorDialog(containerId) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) return;
    const errorElements = containerElement.getElementsByClassName('failed');
    if (errorElements.length > 0) {
      const scrollContainer = document.getElementsByClassName('content')[0];
      scrollContainer.scrollTo({
        top: errorElements[0].offsetTop - 90,
        behavior: 'smooth',
      });
    }
  },

  scrollToFirstError(containerID) {
    const containerElement = document.getElementById(containerID);
    if (!containerElement) return;
    const errorElements = containerElement.getElementsByClassName('failed');
    if (errorElements.length > 0) {
      let scrollContainer = containerElement;
      if (containerID === 'app') scrollContainer = window;
      scrollContainer.scrollTo({
        top: errorElements[0].offsetTop - 90,
        behavior: 'smooth',
      });
    }
  },
};
