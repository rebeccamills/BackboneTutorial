// Setup some requirements. Jquery and Underscore are requiremetns for backbone
require([
    'jquery', 
    'underscore',
    'backbone',
], function($, _, Backbone){

    // Setup Main URl: This is where Backbone will make its API calls (Look up JSON files with data)
    // var url_root = "http://10.6.1.124/~jorgesilvajetter/2013/BackboneTutorial/"
    var url_root = "http://localhost/~jorgesilva/2013/BackboneTutorial/"

    $.ajaxSetup({
        crossDomain: true,
        dataType: 'jsonp',
    });

    /* Movie Model
    **********************/

    // Setup and Empty Movie Model with some empty defaults
    // This will be later populated by the JSON file we will call
    var Movie = Backbone.Model.extend({
        defaults: {
            id: '',
            title: '',
            mpaa_rating: '',
            runtime: '',
            release_dates: '',
            ratings: '',
            synopsis: '',
            movieers: '',
            abridged_cast: '',
            links: '',
        },
        initialize :  function(){
            // Try to get id here...
        }
    });

    /* Collection
    ************************/

    // Initiate an allMovies variables so that it can be shared by the APP
    // this is empty and will host a collection of 
    var allMovies;
    MovieCollection = Backbone.Collection.extend({
        model: Movie,
    });

    /* Query Model
    *********************/

    // This is basically a hack
    /*
        On a well structured API, you can customize what goes in and what goes out, 
        but in our case, using  the Rotten Tomates API we have very little freedom
        about how we strucuture out data. Fot his reason, we'll create a model with this 
        query and then let it parse our JSON into our Movie Model

    */
    var QueryMovie = Backbone.Model.extend({
        // Look for the response here
        url: url_root + 'api/index.php',
        defaults: {
            query :'',
            results : '',
            url : '',
        },
        initialize : function(){},
        parse : function(response){
            // Parse our query by only getting the movies object
            var all = [];
            for(key in response.movies){
                all.push(new Movie(response.movies[key]));
            }
            // Make a Collection out of this objects
            allMovies = new MovieCollection(all);
            // Make a View out of this collection
            var list_view = new ListMovies();
            return response.movies;
        }
    });

    /* The Query 
    ************************/

    // Create one query object
    var initial_query = new QueryMovie();

    // Create a function for parsing it
    function queryMovies(query){
        initial_query.save(query, {
            success: function () {
                console.log(" * initial_query success * ");
            }
        })
    }

    /* Views 
    ************************/

    // Two simple view with one paragrph each. 
    // We want these to be seperate views in order to tie them to the router

    HomeView = Backbone.View.extend({
        // Object in which this Model will be rendered
        el: '#movies_container',
        // Template used for this (in index.html). Parsed by undersocre
        template: _.template($("#home_view").html()),
        initialize: function(){
            // When you create this template, render it
            this.render();
        },
        render: function(){
            this.$el.html( this.template());
        }
    });

    NothingFoundView = Backbone.View.extend({
        // Object in which this Model will be rendered
        el: '#movies_container',
        // Template used for this (in index.html). Parsed by undersocre
        template: _.template($("#not_found_view").html()),
        initialize: function(){
            // When you create this template, render it
            this.render();
        },
        render: function(){
            this.$el.html( this.template());
        }
    });

    // A view for our colleciton of movies
    // This view renders individual ListMovieSingle views
    ListMovies = Backbone.View.extend({
        // This will render in the following container
        el: '#movies_container',
        initialize: function(){
            // Tie this view to the allMovies collection
            this.coll = allMovies;
            // Render on init
            this.render();
            // When our collection changes, re-render this view
            this.listenTo(this.coll, "change", this.render);
        },
        render: function(){
            // Empty the container (Pure and simple Jquery here)
            this.$el.html('');
            // Render (with underscore) and append (with Jquery) each item in this collction
            this.coll.each(function(movie, i){
                // Pass variables to the template throuth the 'movie' variable
                var singleMovieMovie = new ListMoviesSingle({ movie: movie });
                // Add it to the DOM
                this.$el.append(singleMovieMovie.render(i).el);
            }, this);
            return this;
        }
    });

    // A view for one individual movie in a list
    ListMoviesSingle = Backbone.View.extend({
        // This view will not be tied to an element, but will have a template
        // Look for the template in index.html
        template: _.template($("#movie_single_short").html()),
        initialize: function(){

        },
        render: function(i){
            // Create an object from this model
            var pass_to_template = (this.options.movie.toJSON());
            // Pass that object along to the template for rendering
            this.$el.html( this.template({ movie: pass_to_template, index : i }));
            return this;
        },
        events : {
            // Bind the click event to the router
            'click' : 'goToMovie',
        },
        goToMovie: function(){
            // Change the views, but do it through the router
            router.navigate('movies/' +  this.options.movie.id , true);
        }
    });

    // A view for a long format single moview listing, with more details
    SingleMovie = Backbone.View.extend({
        // Tie this to the same DOM element as everything else
        el: '#movies_container',
        // Look for the template in index.html
        template: _.template($("#movie_single").html()),
        initialize: function(){
            // Render on init
            this.render(); 
        },
        render: function(){
            // Pass the model/object to the template and add it to the DOM
            this.$el.html('').append( this.template({ movie: this.model.toJSON() }));
            return this;
        }
    });
    
    // A separete view for search
    SearchView = Backbone.View.extend({
        // Tied to an element in the DOM
        el: '#search_container',
        // Tied to a template
        template: _.template($("#search_template").html()),
        initialize: function(){
            // Render on init
            this.render();
        },
        render: function(){
            // We don't pass any variables here
            this.$el.html(this.template());
            return this;
        },
        events : {
            // We bind certain events to a custom function, which looks for movies in the API
            "change" : "query_movies",
            'click .submit' :  "query_movies",
        },
        query_movies : function(){
            // Using jquery, find the query term
            var this_query_term = $(this.el).find('.search-box').val();
            // Push the query term to the router
            router.navigate('search/' +  encodeURIComponent(this_query_term) , true);
        }
    });

    /* Router
    ************************/

    var Router = Backbone.Router.extend({
        routes : {
            "movies/:id": "getMovie",
            "search/:query": "search",
            "not-found": "notFound", // For when we can't find something
            '*path':  'defaultRoute', // Our last resort, go home
        },
        defaultRoute : function() {
            // Simple one paragraph view
            this.loadView(new HomeView());
        },
        notFound : function(){
            // Simple one paragrah view
            this.loadView(new NothingFoundView());
        },
        search : function(this_query_term){

            // Create an array to send to the API
            var this_query = {
                query: this_query_term,
            }
            // Call the queryMovies function (tied to the Query Model) and pass along the query
            this.loadView(queryMovies(this_query));
        },
        getMovie : function(id){
            // if our Collection hasn't been initiated, go home
            if(allMovies === undefined){
                router.navigate('/', true);
            }
            // Using the id form the url, find this model
            var this_movie = allMovies.get(id);
            try {
                // Create a SingleMovie model, which will render upon init
                this.loadView(new SingleMovie({ model : this_movie }));
            }
            catch(err){
                // No model with this id exists, so NOT FOUND
                router.navigate('not-found', true);
            }
            
        },
        loadView : function(view) {
            // Keep track of where we are
            this.view = view;
        }
    });
    
    // By default, we init our search and our router
    var serch_view = new SearchView();
    var router = new Router();
    // URLs don't work without this
    Backbone.history.start();

});
