const cors = require('cors');
const express = require('express');
const OpenAPIBackend = require('openapi-backend').default;

const apiSpec = require('./swagger.json');
const apiV1UserRead = require('./data/user.json');
const apiV1ActivitiesRead = require('./data/activities.json');
const apiV1EntitiesActivitiesRead = require('./data/entities.activities.json');
const apiV1EntitiesRead = require('./data/entities.json');
const apiV1EntitiesSearch = require('./data/entities.id.search.json');
const apiV1EntitiesSecondaryDetails = require('./data/entities.secondaryDetails.json');
const apiV1Filters = require('./data/filters.json');
const apiV1SearchResultsRead = require('./data/discover.search.results.json');
const apiV1InitialResults = require('./data/initial.json');

const port = 9001;

// Api modifications
const apiSpecModified = apiSpec;

// openapi-backend could not resolve paths with a trailing slash
// remove trailing slashes from paths
Object.entries(apiSpecModified.paths).forEach(([key, value]) => {
  apiSpecModified.paths[key.replace(/\/$/, '')] = value;
  delete apiSpecModified.paths[key];
});

// add additional routes
apiSpecModified.paths['/swagger.json'] = {
  get: {
    operationId: 'swagger',
    responses: {},
  },
};

// config app
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// define api
const api = new OpenAPIBackend({
  definition: apiSpecModified,
  handlers: {
    api_v1_user_retrieve: async (c, req, res) => {
      // TODO: mock failing of request (403)
      res.status(200).json(
        apiV1UserRead,
      );
    },
    api_v1_initial_retrieve: async (c, req, res) => {
      res.status(200).json(apiV1InitialResults);
    },
    api_v1_filters_list: async (c, req, res) => res.status(200).json(
      apiV1Filters,
    ),
    api_v1_search_create: async (c, req, res) => {
      const { offset, limit, filters } = req.body;
      let matching = [];
      // check if filter is from initial results (currently a workaround - future of
      // 'current_activities' filter is unclear
      if (filters.length === 1 && filters[0].id === 'current_activities') {
        // if current activities take results from initial data and slice for correct page etc
        matching = {
          ...apiV1InitialResults.results[0],
          data: apiV1InitialResults.results[0].data.slice(offset, offset + limit),
        };
        // else assume regular search
      } else {
        let tempResult = [];
        filters.forEach((filter) => {
          let filterMatches = [];
          // special case filter activity type
          if (filter.id === 'type') {
            filterMatches = apiV1SearchResultsRead.filter((result) => filter.filter_values
              .map((val) => val.label).includes(result.description));
          }
          // free text search fulltext or for certain types of entries
          // this should not be like this in live just to simplify data fetching
          // live: even if one of these filters is used fetch related persons etc.
          if (filter.filter_values && filter.filter_values.length
            && ['fulltext', 'default', 'activities', 'persons', 'albums'].includes(filter.id)) {
            // TODO: consider match id to just get specific autocomplete selected result
            filterMatches = apiV1SearchResultsRead
              .filter((result) => (filter.id === 'default' || filter.id === 'fulltext' || result.type === filter.id)
                && filter.filter_values
                  .some((stringVal) => result.title.toLowerCase()
                    .includes(stringVal.toLowerCase())));
          }
          // Controlled Vocabulary Filters with array filter_values
          if (['keywords', 'skills'].includes(filter.id)) {
            const filterValueIds = filter.filter_values.map((val) => val.id);
            filterMatches = apiV1SearchResultsRead
              .filter((result) => result[filter.id] && result[filter.id].map((entry) => entry.id)
                .some((entryId) => filterValueIds.includes(entryId)));
          }
          // concat the results for every filter to have more results but make unique
          tempResult = [...new Set(tempResult.concat(filterMatches))];
        });

        matching = {
          label: 'Search Results',
          total: tempResult.length,
          data: tempResult.slice(offset, offset + limit),
        };
      }
      setTimeout(() => {
        res.status(200).json(
          matching,
        );
      }, 1000);
    },
    api_v1_autocomplete_create: async (c, req, res) => {
      const searchString = c.request.body.q;
      const filterId = c.request.body.filter_id;
      let matchingData = [];
      let dataSubset = apiV1SearchResultsRead;
      if (filterId !== 'default') {
        dataSubset = dataSubset.filter((entry) => entry.type === filterId);
      }
      if (searchString) {
        matchingData = dataSubset.filter((entry) => {
          return entry.title.toLowerCase()
            .includes(searchString.toLowerCase());
        });
        matchingData = matchingData.reduce((prev, curr) => {
          // get the category needed
          const cat = prev.find((resultCat) => resultCat.source === curr.type);
          if (cat) {
            cat.data.push(curr);
          } else {
            prev.push({
              source: curr.type,
              label: apiV1Filters.find((filter) => filter.id === curr.type).label,
              data: [].concat(curr),
            });
          }
          return prev;
        }, []);
      }
      return res.status(200).json(
        matchingData,
      );
    },
    api_v1_activities_retrieve: async (c, req, res) => res.status(200).json(
      apiV1ActivitiesRead,
    ),
    api_v1_entities_search_create: async (c, req, res) => {
      const entityId = c.request.params.id;
      const entityData = apiV1EntitiesSearch[entityId];
      if (entityData && entityData.length) {
        return res.status(200).json(
          {
            total: entityData.length,
            data: entityData,
          },
        );
      }
      return res.status(200).json([]);
    },
    api_v1_entities_retrieve: async (c, req, res) => res.status(200).json(
      apiV1EntitiesRead,
    ),
    api_v1_entities_list_retrieve: async (c, req, res) => res.status(200).json(
      apiV1EntitiesActivitiesRead,
    ),
    api_v1_entities_edit_retrieve: async (c, req, res) => {
      let response = {};
      if (req.query.secondary_details) {
        response = { secondary_details: apiV1EntitiesSecondaryDetails };
      }

      if (req.query.showcase) {
        response = { showcase: [] };
      }

      res.status(200).json(response);
    },
    api_v1_entities_edit_partial_update: async (c, req, res) => {
      let response = [];
      if (req.body.secondary_details) {
        response = req.body;
      }

      if (req.body.showcase) {
        const showcase = req.body.showcase.map((item) => {
          const data = apiV1SearchResultsRead.find((entry) => entry.id === item.id);
          return {
            ...item,
            data: {
              ...data,
              previews: [
                { '640w': 'https://placeimg.com/640/400/arch' },
                { '768w': 'https://placeimg.com/768/600/arch' },
              ],
            },
          };
        });

        response = { showcase };
      }

      setTimeout(() => {
        res.status(200).json(response);
      }, 1000);
    },
    swagger: async (c, req, res) => {
      // remove schema 'CommonList', due problems with converting circular structures to JSON
      // - not needed for further frontend processing
      // "oneOf": [{ "$ref": "#/components/schemas/CommonList" },
      //           { "$ref": "#/components/schemas/CommonListItem" }]
      apiSpec.components.schemas.CommonList.properties.data.items.oneOf.shift();

      return res.status(200).json(apiSpec);
    },
    notFound: async (c, req, res) => res.status(404).json({ err: 'not found' }),
    notImplemented: async (c, req, res) => {
      const { status, mock } = c.api.mockResponseForOperation(c.operation.operationId);
      return res.status(status).json(mock);
    },
  },
});

// init api
api.init();

// use as express middleware
app.use((req, res) => api.handleRequest(req, req, res));

// start server
app.listen(port, () => console.info(`API listening at http://0.0.0.0:${port}`));
