/* --------------------------------------------
 * DocAwards' v1.0
 * URL: http://airball.in
 * Author: Bharani Muthukumaraswamy <bharani91@gmail.com>
 * Author URL: http://abhayam.co.in
 --------------------------------------------*/

jQuery(document).ready(function($) {
  window.initialize_map = function(obj)  {

      // Creating a LatLng object containing the coordinate for the center of the map
      var latlng = new google.maps.LatLng(obj[0]["lat"], obj[0]["long"]);
      // Creating an object literal containing the properties we want to pass to the map
      var options = {
        zoom: 12,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }; 
      // Calling the constructor, thereby initializing the map
      
      var map = new google.maps.Map(document.getElementById('map'), options);
      _.each(obj, function(location) {
        console.log(location);
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(location["lat"], location["long"]), 
          title: location["name"],
          map: map
        });

        infobubble = new InfoBubble({
          map: map,
          content: '<div class="text">' + location["name"] +'</div>',
          position: new google.maps.LatLng(location["lat"], location["long"]),
          shadowStyle: 1,
          padding: 0,
          backgroundColor: 'rgb(57,57,57)',
          borderRadius: 4,
          arrowSize: 10,
          borderWidth: 1,
          borderColor: '#2c2c2c',
          disableAutoPan: true,
          hideCloseButton: false,
          arrowPosition: 30,
          backgroundClassName: 'infobubble',
          arrowStyle: 2
        });


        google.maps.event.addListener(marker, 'click', function() {
          infobubble.setContent('<div class="text">' + marker.title + '</div>');
          infobubble.open(map,marker);
        });


      });
      
  }
  
  // Models
  window.Doctor = Backbone.Model.extend({
    sync: function(method, model, options) {
      options = options || {};
      options.dataType = "jsonp"; 
      options.jsonpCallback = "cbck";
      Backbone.sync(method, model, options);
    },

    initialize: function (options) {
      this.id = options.id;  
    },

    url: function() {
      return "http://docawards.com/doctors/get_doctors.json?doctor_id=" + this.id + "&jsonp_callback=cbck"
    },

    parse: function(resp) {
      return resp[0]
    }
  });


  // For Doc listing page
  window.DoctorHeadShot = Backbone.Model.extend();


  // Generic
  window.DoctorList = Backbone.Collection.extend({
    model: DoctorHeadShot,
    
    sync: function(method, model, options) {
      options = options || {};
      options.dataType = "jsonp"; 
      options.jsonpCallback = "cbck";
      Backbone.sync(method, model, options);
    }  
  });

  window.DiseaseDoctorList = window.DoctorList.extend({
    initialize: function(options) {
      this.id = options.id;
    },

    url: function() {
      return "http://docawards.com/doctors/get_doctors.json?disease_id=" + this.id + "&jsonp_callback=cbck"
    },
  });

  window.SpecialityDoctorList = window.DoctorList.extend({
    initialize: function(options) {
      this.id = options.id;
    },

    url: function() {
      return "http://docawards.com/doctors/get_doctors.json?speciality=" + this.id + "&jsonp_callback=cbck"
    },
  });

  window.DoctorHeadShotView = Backbone.View.extend({
    className: "feed_entry doctor_list six columns",
    template: _.template($("#feed_entry").html()),
    initialize: function() {
      this.render();
    },

    render:function () {
      console.log(this.model.toJSON());
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    },

  });

  window.DoctorListView = Backbone.View.extend({
    className: "row doctor_list_view",
    id: "content",
    initialize: function() {
      var that = this;
      this.collection.fetch({
        success: function(collection) {
          console.log(collection);
          that.render();
        }
      })
    },
    render: function() {
      var that = this;
      _.each(this.collection.models, function(doctor) {
        var profile = new DoctorHeadShotView({model: doctor});
        $(that.el).empty();
        $(profile.el).wrapInChunks('<div class="row" />', 2).appendTo($(that.el));


        
      });

      $("body").append(this.el);
      $(document).foundationButtons();
    }

  })


  // Views
  window.DoctorView = Backbone.View.extend({
    className: "row doctor_profile",
    id: "content",
    template: _.template($("#doctor_template").html()),
    initialize: function()  {
      var that = this;
      this.model.fetch({
        success: function(model) {
          // render headshot
          that.render();
        }
      })
    },

    render: function()  {
      var model = this.model.toJSON()
      $(this.el).append(this.template({
        headshot: model["Doctor"],
        specializations: model["Docspeclink"],
        qualifications: model["Qualification"],
        experiences: model["Experience"],
        contacts: model["DoctorContact"],
        consultations: model["Docconsultlocation"]
      }));

      $("body").append(this.el);
      var heights = [];
      $(this.el).find(".about_doc").each(function() {
        heights.push($(this).height());
      });
      $(".about_doc").height(Math.max.apply(null, heights));

      var latlng = [];
      _.each(model["Docconsultlocation"], function(consultation) {
        var temp = {};
        temp["lat"] = consultation["Location"]["lat"];
        temp["long"] = consultation["Location"]["long"];
        temp["name"] = consultation["Location"]["name"]
        latlng.push(temp);
      });
      window.initialize_map(latlng);
    },

  });


  window.HomeView = Backbone.View.extend({
    template: _.template($("#landing_template").html()),
    initialize: function()  {
      this.render();
    },

    render: function()  {
      $("body").html(this.template());
    } 
  });

  window.FooterView = Backbone.View.extend({
    template: _.template($("#footer_template").html()),
    initialize: function()  {
      this.render();
    },

    render: function()  {
      $("body").append(this.template());
    } 
  });

  window.JumbotronView = Backbone.View.extend({
    template: _.template($("#jumbotron").html()),
    initialize: function()  {
      this.render();
    },

    render: function()  {
      $("body").append(this.template());
    } 
  });

  window.HeaderView = Backbone.View.extend({
    template: _.template($("#header_template").html()),
    initialize: function()  {
      this.render();
    },

    render: function()  {
      $("body").html(this.template());
    }  
  });


  // Router
  var AppRouter = Backbone.Router.extend({
    routes:{
        ""                :       "home",
        "doctor/:id"      :       "doctorProfile",
        "disease/:id"     :       "diseaseListing",
        "speciality/:id"  :       "specialityListing"
    },

    home: function()  {
      var landing_view = new HomeView();
      var footer_view = new FooterView();

      $(".chzn-select").chosen();
      window.autocomplete_select();

      $('#carousel').elastislide({
        imageW  : 180,
        minItems  : 5
      });

      $("#search_btn").live("click", function() {
        var selected = $(".chzn-select option:selected"),
            type = selected.data("type"),
            id = selected.data("id");

        if(!selected) {
          alert("Please select a term!");
          return false;
        } else if(type == "doctor") {
          window.app.navigate("#doctor/" + id, true)
          return false;
        } else if(type == "disease") {
          window.app.navigate("#disease/" + id, true)
          return false;
        } else if(type == "speciality") {
          window.app.navigate("#speciality/" + id, true);
          return false;
        }
        
      })

      // fadeIn elements
      // var timeOuts = new Array();
      // var eT=200;
      // function myFadeIn(jqObj) {
      //     jqObj.fadeIn('slow');
      // }
      // $('.fade').hide().each(function(index) {
      //     timeOuts[index] = setTimeout(myFadeIn, index*eT, $(this));
      // });


      

    },

    doctorProfile: function(id)  {
      var header_view = new HeaderView();
      var doctor = new Doctor({id: id});
      var doctor_view = new DoctorView({model: doctor});
    },

    diseaseListing: function(id) {
      var header_view = new HeaderView();
      var jumbotron_view = new JumbotronView();
      var doctor_list = new DiseaseDoctorList({ id: id });
      var doctor_list_view = new DoctorListView({collection: doctor_list});
    },

    specialityListing: function(id) {
      var header_view = new HeaderView();
      var jumbotron_view = new JumbotronView();
      var doctor_list = new SpecialityDoctorList({ id: id });
      var doctor_list_view = new DoctorListView({collection: doctor_list});
    }


  });

  window.app = new AppRouter();
  Backbone.history.start();

});