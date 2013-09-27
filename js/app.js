// Place third party dependencies in the lib folder
//
// Configure loading modules from the lib directory,
// except 'app' ones, 
requirejs.config({
    "baseUrl": "js/lib",
    'urlArgs': "bust=" + (new Date()).getTime(),
    "paths": {
		"app": "../app"
    },
	shim: {
		"backbone": {
			//These script dependencies should be loaded before loading backbone.js
			deps: ['underscore', 'jquery'],
			//Once loaded, use the global 'Backbone' as the module value.
			exports: 'Backbone'
		},
		"underscore": {
			exports: '_'
		},
	}
});

// Load the main app module to start the app
requirejs(["app/main"]);

console.log("APP JS IS LOADING");