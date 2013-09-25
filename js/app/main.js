require([
    'jquery', 
    'underscore',
    'backbone',
], function($, _, Backbone){

    $.ajaxSetup({
        crossDomain: true,
        dataType: 'jsonp',
    });

    /* Post Model
    **********************/

    var Post = Backbone.Model.extend({
        defaults: {
            id: '',
            title: '',
            mpaa_rating: '',
            runtime: '',
            release_dates: '',
            ratings: '',
            synopsis: '',
            posters: '',
            abridged_cast: '',
            links: '',
        },
        initialize :  function(){
            // Try to get id here...
        }
    });

    /* Collection
    ************************/

    var PostCollection;
    var allPosts;

    PostCollection = Backbone.Collection.extend({
        model: Post,
    });

    /* Query Model
    *********************/

    var QueryPost = Backbone.Model.extend({
        url: 'http://localhost/~jorgesilva/2013/BackboneTutorial/api/index.php',
        defaults: {
            query :'',
            results : '',
            url : '',
        },
        initialize : function(){

        },
        parse : function(response){
            console.log(" * Parsing Query * ");
            console.log(response.movies);
            all = [];
            for(key in response.movies){
                all.push(new Post(response.movies[key]));
            }
            allPosts = new PostCollection(all);
            console.log(allPosts.models);

            var list_view = new ListPosts();

            return response.movies;
        }
    });

    /* The Query 
    ************************/

    var this_query = {
        query: 'James Bond',
    }
    
    var initial_query = new QueryPost();

    initial_query.save(this_query, {
        success: function (initial_query) {
            console.log(" * initial_query * ");
            console.log(initial_query);            
        }
    })

    /* Views 
    ************************/

    ListPosts = Backbone.View.extend({
        el: '#posts_container',
        template: _.template($("#single_post_template").html()),
        initialize: function(){
            this.coll = allPosts;
            this.listenTo(this.coll, 'reset', this.render);
            //console.log(this.coll.toJSON());
            this.render();
        },
        render: function(){
            this.$el.html(this.template({ posts: this.coll.toJSON() }));
            return this;
        },
        events: {
            "click input[type=button]": "prettiFy"
        },
        prettiFy: function( event ){
            // Button clicked, you can access the element that was clicked with event.currentTarget
            console.log( "prettiFy" );
        }
    });

    setTimeout(function(){

    }, 2000);

    /* Utilities 
    ************************/

});
