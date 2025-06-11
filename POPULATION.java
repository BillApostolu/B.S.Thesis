// Center map above Athens
Map.centerObject(ROI);


// Filter by country
var dataset_Greece = dataset.filter(ee.Filter.eq('country', 'GRC'));

// Select first image (2020) - Clip to Athens boundaries
var dataset_Athens = dataset_Greece.first().clip(ROI);

// Add population M/F above 65
var dataset_Athens_gt65 = (dataset_Athens.select('M_65'))
  .add(dataset_Athens.select('M_70'))
  .add(dataset_Athens.select('M_75'))
  .add(dataset_Athens.select('M_80'))
  .add(dataset_Athens.select('F_65'))
  .add(dataset_Athens.select('F_70'))
  .add(dataset_Athens.select('F_75'))
  .add(dataset_Athens.select('F_80'))
  .rename('gt65');

print(dataset_Athens_gt65)

var pop_gt65 = dataset_Athens_gt65.select('gt65')

var visualization = {
  min: 0.0,
  max: 40.0,
  palette: ['24126c', '1fff4f', 'd4ff50']
};

Map.addLayer(pop_gt65, visualization, "Population");

var PopGT65mean = dataset_Athens_gt65.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: ROI,
  scale: 30
});

print("Mean population greater than 65: ", PopGT65mean);


Export.image.toDrive({
  image: pop_gt65,
  description: 'Population_GT65_ROI',
  folder: 'GIS07_layers',
  region: ROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
