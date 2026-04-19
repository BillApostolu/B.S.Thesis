var dataset = ee.Image('WORLDCLIM/V1/BIO');
var tmax = dataset.select('bio05').multiply(0.1).clip(ROI);
var visParams = {
  min: 28,
  max: 33.5,
  palette: ['blue', 'purple', 'cyan', 'green', 'yellow', 'red'],
};

Map.setCenter(23.7,37.9, 8);

Map.addLayer(tmax, visParams, 'tmax of the warmest month');

// Export image
Export.image.toDrive({
  image: tmax,
  description: 'Tmax_warmest_month_ROI',
  folder: 'GIS07_layers',
  region: ROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
