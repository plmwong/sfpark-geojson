/**
 * @summary Translates the response from the SFPark API to a GeoJSON compatible format.
 */

var sfParkGeoJson = (function () {
  var my = { };

  function createBasicFeature(points, location, name, lotType) {
    var feature = {
      "type": "Feature",
      "properties": { "name": name, "lotType": lotType }
    };

    var coordinates = location.split(',');

    if (points === 1) {
      feature["geometry"] = { "type": "Point", "coordinates": [ parseFloat(coordinates[0]), parseFloat(coordinates[1]) ] };
    }

    if (points === 2) {
      feature["geometry"] = { "type": "LineString", "coordinates": [ [ parseFloat(coordinates[0]), parseFloat(coordinates[1]) ], [ parseFloat(coordinates[2]), parseFloat(coordinates[3]) ] ] };
    }

    return feature;
  }

  my.translate = function(sfParkJson) {
    var geoJson = {
      "type": "FeatureCollection",
      "features": [ ]
    };

    sfParkJson.AVL.forEach(function(availability) {
      var type = availability.TYPE;

      if (type === 'ON') {
        var numberOfPoints = parseInt(availability.PTS);
        var location = availability.LOC;
        var name = availability.NAME;

        var onStreetFeature = createBasicFeature(numberOfPoints, location, name, 'on_street');
        geoJson["features"].push(onStreetFeature);
      }

      if (type === 'OFF') {
        var numberOfPoints = parseInt(availability.PTS);
        var occupancy = parseInt(availability.OCC);
        var capacity = parseInt(availability.OPER);
        var location = availability.LOC;
        var name = availability.NAME;

        var availability = (occupancy / capacity * 100.0).toFixed(2);

        var offStreetFeature = createBasicFeature(numberOfPoints, location, name, 'off_street');
        offStreetFeature.properties['occupancy'] = occupancy;
        offStreetFeature.properties['capacity'] = capacity;
        offStreetFeature.properties['availability'] = availability;

        geoJson["features"].push(offStreetFeature);
      }
    });

    return geoJson;
  };

  return my;
}());
