# sfpark-geojson

Simple javascript module for translating the response taken from an SFPark API (http://api.sfpark.org/sfpark) query to a GeoJSON compatible format. This can then be used with a GeoJSON compatible
service or application such as Google Maps.

## Sample

`npm` and NodeJS are only used in this solution to host a static web server.

```
npm install
node .
```

Then browse to http://localhost:8080 to view the sample Google Map using data from the SFPark API.

![Sample Google Map](assets/sample.png)
