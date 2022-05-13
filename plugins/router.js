let previousPage = '';

export default ({ app }) => {
  app.router.beforeEach((to, from, next) => {
    // if ssr, do nothing
    if (!process.client) return;

    const fromIsEntityPerson = !!from.path.match(/[\w-]+-[\w]+/gm);

    if (fromIsEntityPerson) {
      const key = from.path;
      const history = JSON.parse(window.sessionStorage.getItem('history')) || {};

      // if object does not exist, create it
      if (!history[key]) {
        history[key] = {};
      }
      // set scroll y position to object
      history[key].y = window.scrollY;

      // set new history to sessionStorage
      window.sessionStorage.setItem('history', JSON.stringify(history));
    }

    next();
  });

  app.router.afterEach((to, from) => {
    // if ssr, do nothing
    if (!process.browser) return;

    // check history back
    if (to.path === previousPage) {
      // get history from current page
      const key = to.path;
      const history = JSON.parse(window.sessionStorage.getItem('history'));

      // get scroll y position
      const y = history
      && history[key]
      && history[key].y ? history[key].y : 0;

      // scroll to y position
      window.scrollTo(0, y);

      return;
    }

    // TODO: when from entity person to a activity then it should stay on current scroll position
    //       currently on an entity page it always scrolls to 0
    // otherwise scroll to top
    window.scrollTo(0, 0);

    // save from path for next comparison
    previousPage = from.path;
  });
};
