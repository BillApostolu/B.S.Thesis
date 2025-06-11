// Center map above Athens
Map.centerObject(ROI);

// Select band for surface temperature
L8 = L8.select("ST_B10");

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
var L8_selected = L8_filtered.median().clip(ROI);
print(L8_selected);

// Rescale pixel values 
L8_selected = L8_selected.multiply(0.00341802).add(149).subtract(273.15);

var palette = ['blue', 'limegreen', 'yellow', 'darkorange', 'red'];
var lstVis = {min:26, max:45, palette: palette};

Map.addLayer(L8_selected, lstVis , "LST");

var LSTmean = L8_selected.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: ROI,
  scale: 30
});
print("Mean LST: ", LSTmean);


Export.image.toDrive({
  image: L8_selected,
  description: 'LST_ROI',
  folder: 'GIS07_layers',
  region: ROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
