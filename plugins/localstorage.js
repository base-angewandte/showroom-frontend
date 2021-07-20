export default ({
  isHMR,
}) => {
  if (isHMR) return;
  // eslint-disable-next-line consistent-return
  window.onNuxtReady(() => {});
};
