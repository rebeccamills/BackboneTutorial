require([
    'jquery', 
    'underscore',
    'backbone',
], function($, _, Backbone){
    
    /* Person Model
    **********************/

	Person = Backbone.Model.extend({
		defaults: {
            name: 'Fetus',
            age: 0,
            child: ''
        },
        initialize: function(){
            this.on("change:name", function(model){
                var name = model.get("name"); // 'Stewie Griffin'
            });
        },
        adopt: function( newChildsName ){
            this.set({ child: newChildsName });
        }
    });
    
    var people = [];
    for(var i = 0; i < 2; i++){
    	people.push( new Person({ age: parseInt(Math.random() * 10)}) );
    	people[people.length - 1].adopt(parseInt(Math.random() * 10) + 20)
    }

    setTimeout(function(){
    	people[parseInt(Math.random() * people.length)].set({name: 'Stewie Griffin'});
    }, 1000);

    /* Post Model
    **********************/

    var Post = Backbone.Model.extend({
        urlRoot: '/~jorgesilva/2013/backbone/data',
        defaults: {
            id: '',
            type: '',
            title: '',
            content: '',
            url: '',
            date: '',
            modified: '',
        },
        initialize :  function(){
            // Try to get id here...
        },
        parse : function(response, index, i2){
            console.log(index);
            console.log(i2);
            return response.posts[0];  
        }   
    });

    var post = new Post({helo: 1});

    // The fetch below will perform GET /user/1
    // The server should return the id, name and email from the database
    post.fetch({
        success: function (data) {
            console.log("Post #" + post.get("id") + " loaded succsefully.");
        }
    });

    /* Collection
    ************************/

    var PostCollection = Backbone.Collection.extend({
        model: Post
    });

    var AllPosts = new PostCollection([ post ]);

    console.log( AllPosts.models );

    /* Views 
    ************************/

    ListPosts = Backbone.View.extend({
        el: '#posts_container',
        template: _.template($("#single_post_template").html()),
        initialize: function(){
            this.coll = new PostCollection([ post ]);
            this.listenTo(this.coll, 'reset', this.render);
            console.log(this.coll.toJSON());
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
        var list_view = new ListPosts();
    }, 500);

});
