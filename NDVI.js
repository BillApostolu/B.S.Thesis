// Center map above Athens
Map.centerObject(ROI);

// Select bands RED and NIR
L8 = L8.select("SR_B4", "SR_B5");

// Filter by dates (May to September) - region of interest (Athens)
var L8_filtered = L8
  .filter(ee.Filter.date('2020-05-01', '2020-09-30'))
  .filter(ee.Filter.bounds(ROI));

// Mosaic all the images (tiles) that were taken on the same day into one image
function mosaicByDate(imcol){
 var imlist = imcol.toList(imcol.size());

 var unique_dates = imlist.map(function(im){
   return ee.Image(im).date().format("YYYY-MM-dd");
 }).distinct();

 var mosaic_imlist = unique_dates.map(function(d){
   d = ee.Date(d);
   imcol = imcol.filterDate(d, d.advance(1, "day"));
   var im = imcol.mosaic();
   return im.set(
       "system:time_start", d.millis(),
       "system:id", d.format("YYYY-MM-dd"));
 });

 return ee.ImageCollection(mosaic_imlist);
}

// Apply mosaic function to Landsat image collection
L8_filtered = mosaicByDate(L8_filtered);

// Sort images based on cloud cover
L8_filtered = L8_filtered.sort("CLOUD_COVER", true);

// Print number of images
print(L8_filtered.size());

// Median composite
var L8_selected = L8_filtered.median();
print(L8_selected);

// Rescale pixel values 
L8_selected = L8_selected.multiply(0.0000275).add(-0.2);

// Calculation of NDVI for image
var ndvi = L8_selected.normalizedDifference(["SR_B5", "SR_B4"]).rename("ndvi").clip(ROI);

var palette = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
  '74A901', '66A000', '529400', '3E8601', '207401', '056201',
  '004C00', '023B01', '012E01', '011D01', '011301'];

var ndviVis = {min:0, max:0.8, palette: palette };
Map.addLayer(ndvi, ndviVis , "NDVI");

var NDVImean = ndvi.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: ROI,
  scale: 30,
  });
print("Mean NDVI: ", NDVImean);


Export.image.toDrive({
  image: ndvi,
  description: 'NDVI_ROI',
  folder: 'GIS07_layers',
  region: ROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});

