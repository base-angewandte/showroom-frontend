export default {
  LEAFLET: {
    attribution: 'Source: <a href="https://openstreetmap.org"/>OpenStreetMap contributors</a>',
    copyright: '<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>',
    tileLayerService: 'WMS',
    url: 'https://ows.terrestris.de/osm-gray/service',
    // more options for the tile-layer can be found at https://leafletjs.com/reference-1.7.1.html#tilelayer
    options: {
      layers: 'OSM-WMS',
    },
  },
  META: {
    description: {
      de: 'Kuratieren Sie Ihr akademisches Profil. Erzählen Sie die Geschichte Ihrer Arbeit, kooperieren Sie mit Kolleg*innen, erkunden und entdecken Sie.',
      en: 'Curate your academic profile. Tell the story of your work, collaborate, explore, discover.',
    },
  },
};
