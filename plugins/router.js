let popStateDetected = false;
let previousPageKey = null;

window.addEventListener('popstate', () => {
  popStateDetected = true;
});

export default ({ app }) => {
  app.router.beforeEach((to, from, next) => {
    // if ssr or the route did not really change (every kind of query param
    // changes, e.g. for search), do nothing
    if (!process.browser || to.path === from.path) next();
    else {
      // #################################################################
      // set the coordinates for page that was left

      // get the history from session storage
      const history = JSON.parse(window.sessionStorage.getItem('history')) || {};

      if (previousPageKey) {
        // if object does not exist, create it
        if (!history[previousPageKey]) {
          history[previousPageKey] = {};
        }

        // set scroll y position to object
        history[previousPageKey].y = window.scrollY;

        // set new history to sessionStorage
        window.sessionStorage.setItem('history', JSON.stringify(history));
      }
      next();
    }
  });

  app.router.afterEach((to, from) => {
    // if ssr or the route did not really change (every kind of query param
    // changes, e.g. for search), do nothing
    if (!process.browser || to.path === from.path) return;
    // ##################################################
    // check if current page should be adjusted

    // get the history from session storage
    const history = JSON.parse(window.sessionStorage.getItem('history')) || {};
    // get unique identifier for previous page from window history
    const key = window.history.state ? window.history.state.key : null;
    // get scroll y position by checking if browser history.back() was triggered
    // and if relevant position exists in sessionstorage history
    const y = popStateDetected && key && history
    && history[key]
    && history[key].y ? history[key].y : 0;

    // reset history back flag
    popStateDetected = false;
    // store new page identifier as previous page key
    previousPageKey = key;
    // scroll to y position - with a delay so that this only happens after page change
    // the promise is necessary for the timeout to take effect every time
    // eslint-disable-next-line consistent-return
    return new Promise(() => {
      setTimeout(() => {
        window.scrollTo(0, y);
        // this needs to be the same as $page-transition-duration in variables.scss!
        // an extra delay is added if a certain position is needed to make sure everything
        // is rendered
      }, y === 0 ? 250 : 500);
    });
  });
};
