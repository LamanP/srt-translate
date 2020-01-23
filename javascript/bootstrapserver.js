var requirejs = require('requirejs');

requirejs.config( {
   //load the mode modules to top level JS file
   //by passing the top level main.js require function to requirejs
   nodeRequire: require
} );

requirejs(
    "./javascript/transpiled/webserver/SrtServer.js"
, function(){} );