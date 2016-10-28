/**
 * @summary Translates the response from the SFPark API to a GeoJSON compatible format.
 */

var sfParkGeoJson = (function () {
  var my = { };

  function mapRates(rates, feature) {
    if (rates) {
      var mappedRates = [ ];
      if( Object.prototype.toString.call(rates) !== '[object Array]') {
          rates = [ rates ];
      }
      rates.forEach(function(rate) {
        var mappedRate = {
          "start_of_period": rate.BEG,
          "end_of_period": rate.END,
          "rate": rate.RATE,
          "qualifier": rate.RQ,
          "restrictions": rate.RR
        };
        mappedRates.push(mappedRate);
      });

      feature.properties['rates'] = mappedRates;
    }
  }

  function createBasicFeature(points, location, name, rates, lotType) {
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

    mapRates(rates, feature);

    return feature;
  }

  function mapOperatingHours(operatingHours, offStreetFeature) {
    var mappedOperatingHours = [ ];
    if( Object.prototype.toString.call(operatingHours) !== '[object Array]') {
        operatingHours = [ operatingHours ];
    }
    operatingHours.forEach(function(operatingPeriod) {
      var mappedOperatingPeriod = {
        "from": operatingPeriod.FROM,
        "to": operatingPeriod.TO,
        "start_of_period": operatingPeriod.BEG,
        "end_of_period": operatingPeriod.END
      };
      mappedOperatingHours.push(mappedOperatingPeriod);
    });

    offStreetFeature.properties['operatingHours'] = mappedOperatingHours;
  }

  function mapOffStreetProperties(availability, offStreetFeature) {
    var ospid = availability.OSPID;
    var description = availability.DESC;
    var intersection = availability.INTER;
    var phoneNumber = availability.TEL;
    var occupancy = parseInt(availability.OCC);
    var capacity = parseInt(availability.OPER);
    var calculatedAvailability = (occupancy / capacity * 100.0).toFixed(2);

    mapOperatingHours(availability.OPHRS.OPS, offStreetFeature);

    offStreetFeature.properties['sfmtaId'] = ospid;
    offStreetFeature.properties['description'] = description;
    offStreetFeature.properties['intersection'] = intersection;
    offStreetFeature.properties['phoneNumber'] = phoneNumber;
    offStreetFeature.properties['occupancy'] = occupancy;
    offStreetFeature.properties['capacity'] = capacity;
    offStreetFeature.properties['availability'] = calculatedAvailability;
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
        var rates = availability.RATES && availability.RATES.RS;

        var onStreetFeature = createBasicFeature(numberOfPoints, location, name, rates, 'on_street');
        geoJson["features"].push(onStreetFeature);
      }

      if (type === 'OFF') {
        var numberOfPoints = parseInt(availability.PTS);
        var location = availability.LOC;
        var name = availability.NAME;
        var rates = availability.RATES && availability.RATES.RS;

        var offStreetFeature = createBasicFeature(numberOfPoints, location, name, rates, 'off_street');
        mapOffStreetProperties(availability, offStreetFeature);

        geoJson["features"].push(offStreetFeature);
      }
    });

    return geoJson;
  };

  return my;
}());
