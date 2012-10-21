/* --------------------------------------------
 * DocAwards' v1.0
 * URL: http://airball.in
 * Author: Bharani Muthukumaraswamy <bharani91@gmail.com>
 * Author URL: http://abhayam.co.in
 --------------------------------------------*/
 $.fn.serializeFormJSON = function() {

   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};


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

  Backbone.emulateHTTP = true;

  // Test Model
  window.City = Backbone.Model.extend({

    methodUrl: {
      'create': 'http://docawards.com/cities/add',
    },

    sync: function(method, model, options) {
      if (model.methodUrl && model.methodUrl[method.toLowerCase()]) {
        options = options || {};
        options.type = "post";
        options.url = model.methodUrl[method.toLowerCase()];
      }
      console.log("Syncing", model.toJSON());
      $.ajax({
        type: 'POST',
        url: options.url,
        data: model.toJSON(),
        success: function(data) {
          alert("added city")
        }
      });
      
    }
  });

  window.CityContainer = Backbone.View.extend({
    className: "testing",
    template: _.template($("#city_template").html()),
    
    events: {
      "click #submit": "submit_form"
    },

    initialize: function() {
      this.render();
    },


    render: function() {
      $(this.el).html(this.template());
      $("body").append(this.el);
    },

    submit_form: function() {
      var content = this.$("form").serializeFormJSON();
      window.city = new City(content);
      city.save();
      return false;
    }
  })

  // Models
  window.Doctor = Backbone.Model.extend({

    initialize: function (options) {
      this.id = options.id;  
    },

    url: function() {
      return "http://docawards.com/doctors/get_doctors.json?doctor_id=" + this.id
    },

    parse: function(resp) {
      return resp[0]
    }
  });


  window.User = Backbone.Model.extend({
    initialize: function(options) {
      this.id = options.id,
      this.username = options.username
    },
  });


  // For Doc listing page
  window.DoctorHeadShot = Backbone.Model.extend();


  // Generic
  window.DoctorList = Backbone.Collection.extend({
    model: DoctorHeadShot,
  });

  window.DiseaseDoctorList = window.DoctorList.extend({
    initialize: function(options) {
      this.id = options.id;
    },

    url: function() {
      return "http://docawards.com/doctors/get_doctors.json?disease_id=" + this.id
    },
  });

  window.SpecialityDoctorList = window.DoctorList.extend({
    initialize: function(options) {
      this.id = options.id;
    },

    url: function() {
      return "http://docawards.com/doctors/get_doctors.json?speciality=" + this.id
    },
  });

  window.DoctorHeadShotView = Backbone.View.extend({
    className: "feed_entry doctor_list six columns",
    template: _.template($("#feed_entry").html()),
    initialize: function() {
      this.render();
    },

    render:function () {
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
          that.render();
        }
      })
    },
    render: function() {
      var that = this;
      _.each(this.collection.models, function(doctor) {
        var profile = new DoctorHeadShotView({model: doctor});
        console.log(profile.el)
        $(that.el).append(profile.el);
      });

      console.log(this.el);
      $(this.el).find(".feed_entry").wrapInChunks('<div class="row" />', 2).appendTo($(this.el));
      $("body").append(this.el)

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

    events: {
      "submit #signup_form": "signup"
    },

    render: function()  {
      $(this.el).html(this.template())
      $("body").html(this.el);
    },

    signup: function() {
      var $form = this.$("#signup_modal").find("form"),
          form_data = $form.serializeFormJSON();

      console.log(JSON.stringify(form_data));

      $.ajax({
        type: 'POST',
        url: "http://docawards.com/users/add",
        data: form_data,
        success: function(response) {
          var new_id = parseInt($(response).find("#content table tr:last td:first").text()),
              new_username = $(response).find("#content table tr:last td:nth-child(2)").text(),
              user = new User({id: new_id})

          window.current_user = user;

          console.log(window.current_user);
          window.app.navigate("#create_profile", true);
        }
      });
      return false;
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



  // Create Profile
  window.CreateProfileView = Backbone.View.extend({
    className: "row create_profile",
    id: "content",
    template: _.template($("#create_profile").html()),

    initialize: function() {
      this.urls = {
        "specializations" : "http://docawards.com/docspeclinks/add",
        "qualifications" : "http://docawards.com/qualifications/add",
        "experiences" : "http://docawards.com/experiences/add",
        "consultation" : "http://docawards.com/docconsultlocations/add",
        "contact_details" : "http://docawards.com/doctor_contacts/add",

      };
      this.render();
    },

    render: function() {
      $(this.el).html(this.template());
      $("body").append(this.el);
    },

  });

  window.FormData = Backbone.Model.extend({
    initialize: function(options) {
      this.url = options.url;
      var that = this;
    },

    sync: function(method, model, options) {
      console.log("Syncing", model.toJSON());
      $.ajax({
        type: 'POST',
        url: this.url,
        data: model.toJSON(),
        success: function(data) {
          console.log(this.url);
          //save Doctor ID
          if(this.url == "http://docawards.com/doctors/add") {
            console.log(data);
            console.log("Getting Doctor ID")
            var new_id = parseInt($(data).find("#content tr:last-child td:first-child").text());
            window.current_doctor = new User({id: new_id});
            app.navigate("#create_profile/specializations", true)
          }
        }
      });
    }


  });


  window.ProfileFormView = Backbone.View.extend({
    initialize: function(options) {
      var urls = {
        "personal_details" : "http://docawards.com/doctors/add",
        "specializations" : "http://docawards.com/docspeclinks/add",
        "qualifications" : "http://docawards.com/qualifications/add",
        "experiences" : "http://docawards.com/experiences/add",
        "consultation" : "http://docawards.com/docconsultlocations/add",
        "contact_details" : "http://docawards.com/doctor_contacts/add",

      };
      this.model_url = urls[options.url];
      this.el = options.el;
      this.template = _.template($(options.template).html());
      this.render();
      console.log(this.model);
    },

    events: {
      "click .next" : "submit_form" 
    },

    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
    },

    submit_form: function() {
      var data = new FormData({url: this.model_url});
      data.set($(this.el).find("form").serializeFormJSON());

      console.log(data);
      data.save();
      if(!window.current_doctor) {
        return false;  
      }
      

    }
  })


  


  // Router
  var AppRouter = Backbone.Router.extend({
    
    routes:{
        ""                :       "home",
        "doctor/:id"      :       "doctorProfile",
        "disease/:id"     :       "diseaseListing",
        "speciality/:id"  :       "specialityListing",
        "city"            :       "city",
        "create_profile"  :       "createProfile",
        "create_profile/:id":       "createProfileTab"
    },

    home: function()  {
      var landing_view = new HomeView();
      var footer_view = new FooterView();


      // Show Modals
      $('.signup').on("click", function() {
        $('#signup_modal').reveal();
      });

      $('.login').on("click",function() {
        $('#login_modal').reveal();
      });



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
      console.log(doctor);
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
    },

    city: function() {
      var header_view = new HeaderView();
      var city_view = new CityContainer();

    },

    createProfile: function() {
      var header_view = new HeaderView();
      var create_profile_view = new CreateProfileView();
      var form_view = new ProfileFormView({model: window.current_user, url: "personal_details", el: "li#personal_detailsTab", template: "#personal_details_template"});
    },

    createProfileTab: function(id) {
      var header_view = new HeaderView(),
          create_profile_view = new CreateProfileView();
      
      var el = "li#" + id + "Tab",
          template = "#" + id + "_template";

      
      var user_model = (id != "personal_details") ? window.current_doctor : window.current_user;


      var form_view = new ProfileFormView({model: user_model, url: id, el: el, template: template});

      var $tab = $('a[href="#create_profile/' + id + '"]').parent('dd'),
          $activeTab = $tab.closest('dl').find('dd.active');

      var contentLocation = "#" + id + 'Tab';
      //Show Tab Content
      $(contentLocation).closest('.tabs-content').children('li').removeClass('active').hide();
      $(contentLocation).css('display', 'block').addClass('active');
      
      $activeTab.removeClass('active');
      $tab.addClass('active');

      
    }


  });

  window.app = new AppRouter();
  Backbone.history.start();

});