var numberOfClusters = 7;

// Center map above Athens
Map.centerObject(ROI);

// Compose image with bands for LST, NDVI and Population Density (age greater than 65 years)
var HeatRisk_Layers =  LST_ROI.addBands(NDVI_ROI).addBands(TMAX_ROI).addBands(POP_ROI);




// Collect training data inside region of Athens with scale 30 m and number of sample pixels 500
var training_data = HeatRisk_Layers.sample({
  region: ROI,
  scale:100,
  numPixels:500,
});

print("Training data: ", training_data);

// Create an object instance of clusterer & train the clusterer with the training data collected previously
var clusterer = ee.Clusterer.wekaKMeans(numberOfClusters).train(training_data);

print("Clusterer: ", clusterer);

// Get the cluster centers for the training dataset.
var properties = HeatRisk_Layers.bandNames().add("cluster");

var means = training_data.cluster(clusterer)
    .reduceColumns(ee.Reducer.mean().repeat(4).group(4), properties);
print("Cluster centers:", means);

var variances = training_data.cluster(clusterer)
    .reduceColumns(ee.Reducer.variance().repeat(4).group(4), properties);
print("Cluster variances:", variances);

// Apply the clusterer object to the entire image
var clusteredImage = HeatRisk_Layers.cluster(clusterer);

//var clusteredImage = clusteredImage.unmask(-999);

var palette = ["c3c3c3","447dff", "35cd33", "ac8563"];
var LandCoverVis = {
  min: 0.0,
  max: 6.0,
  palette: [
  'dcdcdc', 'bcbcbc',  '878787', '505050' , '290969','192250' , '000000'
],
};



Map.addLayer(clusteredImage, LandCoverVis , "Thermal_risk");


// Export clustered image
Export.image.toDrive({
  image: clusteredImage.unmask(-999),
  description: 'HeatRisk',
  folder: 'GIS07_layers',
  region: ROI,
  scale: 100,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
