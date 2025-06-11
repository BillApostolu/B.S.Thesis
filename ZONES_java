var dataset = ee.ImageCollection('RUB/RUBCLIM/LCZ/global_lcz_map/latest')
            .mosaic();

var visualization = {
  bands: ['LCZ_Filter'],
  min: 1,
  max: 17,
  palette: [
    '8c0000','d10000','ff0000','bf4d00','ff6600',
    'ff9955','faee05','bcbcbc','ffccaa','555555',
    '006a00','00aa00','648525','b9db79','000000',
    'fbf7ae','6a6aff'
    ]
};


var lcz_athens = dataset.clip(ROI).select("LCZ_Filter");

Map.centerObject(ROI);
Map.addLayer(dataset, visualization, 'LCZ_Filter');
Map.addLayer(lcz_athens, visualization, 'LCZ_Athens');

Export.image.toDrive({
  image: lcz_athens,
  description: 'lcz_ROI',
  folder: 'GIS07_layers',
  region: ROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
