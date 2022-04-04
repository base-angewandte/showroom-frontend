let previousPage = '';

export default ({ app }) => {
  app.router.beforeEach((to, from) => {
    // if ssr, do nothing
    if (!process.browser) return;

    const key = from.path;
    const history = JSON.parse(window.localStorage.getItem('history')) || {};

    // if object does not exist, create it
    if (!history[key]) {
      history[key] = {};
    }
    // set scroll y position to object
    history[key].y = window.scrollY;

    // set new history to localStorage
    window.localStorage.setItem('history', JSON.stringify(history));
  });

  app.router.afterEach((to, from) => {
    // if ssr, do nothing
    if (!process.browser) return;

    // check history back
    if (to.path === previousPage) {
      // get history from current page
      const key = to.path;
      const history = JSON.parse(window.localStorage.getItem('history'));

      // get scroll y position
      const y = history
      && history[key]
      && history[key].y ? history[key].y : 0;

      // scroll to y position
      setTimeout(() => {
        window.scrollTo(0, y);
      }, 100);

      return;
    }

    // otherwise scroll to top
    window.scrollTo(0, 0);

    // save from path for next comparison
    previousPage = from.path;
  });
};
