# sfpark-geojson

Simple javascript module for translating the response taken from an SFPark API (http://api.sfpark.org/sfpark) query to a GeoJSON compatible format. This can then be used with a GeoJSON compatible
service or application such as Google Maps.

## Usage
```html
<script type="text/javascript" src="sfpark-geojson.js"></script>
```

```javascript
var queryUrl = '//crossorigin.me/http://api.sfpark.org/sfpark/rest/availabilityservice?radius=3.0&uom=mile&response=json';
$.ajax({
  type: 'GET',
  dataType: 'json',
  url: queryUrl
}).done(function(data) {
  var geoJson = sfParkGeoJson.translate(data);
  //do things with geoJson
});
```

## Sample

`npm` and NodeJS are only used in this solution to host a static web server.

```shell
npm install
node .
```

Then browse to http://localhost:8080 to view the sample Google Map using data from the SFPark API.

![Sample Google Map](assets/sample.png)
