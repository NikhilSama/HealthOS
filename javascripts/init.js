/* --------------------------------------------
 * DocAwards' v1.0
 * URL: http://airball.in
 * Author: Bharani Muthukumaraswamy <bharani91@gmail.com>
 * Author URL: http://abhayam.co.in
 --------------------------------------------*/

jQuery(document).ready(function($) {
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
    template: _.template($("#doctor_template").html()),
    initialize: function()  {
      var that = this;
      this.model.fetch({
        success: function(model) {
          that.render();
        }
      })
    },

    render: function()  {
      var model = this.model.toJSON();
      var headshot = this.model.toJSON()["Doctor"]
      $(this.el).html(this.template(headshot));
      $("body").append(this.el);
    }
  })

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
      var doctor_view = new DoctorView({model: doctor})
      
    }
  });

  window.app = new AppRouter();
  Backbone.history.start();

});