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


  // Views
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
        ""            :       "home",
        "doctor/:id"  :       "doctorProfile"
    },

    home: function()  {
      var landing_view = new HomeView();
      var footer_view = new FooterView();

      $( "#combobox" ).combobox();
      $('#carousel').elastislide({
        imageW  : 180,
        minItems  : 5
      });

      $("#search_btn").live("click", function() {
        var selected = window.selected_item;
        
        if(!selected) {
          alert("Please select a term!");
          return false;
        } else if(selected.type == "doctor") {
          window.app.navigate("#doctor/" + selected.id, true)
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
      
    }
  });

  window.app = new AppRouter();
  Backbone.history.start();

});