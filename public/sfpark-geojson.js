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
      feature["geometry"] = {
        "type": "Point",
        "coordinates": [ parseFloat(coordinates[0]), parseFloat(coordinates[1]) ]
      };
    }

    if (points === 2) {
      feature["geometry"] = {
        "type": "LineString",
        "coordinates": [
          [ parseFloat(coordinates[0]), parseFloat(coordinates[1]) ], [ parseFloat(coordinates[2]), parseFloat(coordinates[3]) ]
        ]
      };
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
        var location = availability.LOC;
        var name = availability.NAME;

        var offStreetFeature = createBasicFeature(numberOfPoints, location, name, 'off_street');

        var ospid = availability.OSPID;
        var description = availability.DESC;
        var intersection = availability.INTER;
        var phoneNumber = availability.TEL;
        var occupancy = parseInt(availability.OCC);
        var capacity = parseInt(availability.OPER);
        var calculatedAvailability = (occupancy / capacity * 100.0).toFixed(2);

        var mappedOperatingHours = [ ];
        var operatingHours = availability.OPHRS.OPS;
        if( Object.prototype.toString.call(operatingHours) !== '[object Array]') {
            operatingHours = [ operatingHours ];
        }
        operatingHours.forEach(function(operatingPeriod) {
          var mappedOperatingPeriod = {
            "from": operatingPeriod.FROM,
            "to": operatingPeriod.TO,
            "start_of_period": operatingPeriod.BEG,
            "end_of_period": operatingPeriod.END,
          };
          mappedOperatingHours.push(mappedOperatingPeriod);
        });

        offStreetFeature.properties['sfmtaId'] = ospid;
        offStreetFeature.properties['description'] = description;
        offStreetFeature.properties['intersection'] = intersection;
        offStreetFeature.properties['phoneNumber'] = phoneNumber;
        offStreetFeature.properties['occupancy'] = occupancy;
        offStreetFeature.properties['capacity'] = capacity;
        offStreetFeature.properties['availability'] = calculatedAvailability;
        offStreetFeature.properties['operatingHours'] = mappedOperatingHours;

        geoJson["features"].push(offStreetFeature);
      }
    });

    return geoJson;
  };

  return my;
}());
