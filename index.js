var static = require('node-static');

var file = new static.Server('./public');

require('http').createServer(function (request, response) {
    console.log('Running static web server on local port 8080');
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8080);
