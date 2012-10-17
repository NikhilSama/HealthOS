 window.render_options = function(result) { 
  $('.chzn-select').append("<optgroup label='Doctors' class='doctors'></optgroup");
  $('.chzn-select').append("<optgroup label='Diseases' class='diseases'></optgroup");
  $('.chzn-select').append("<optgroup label='Specialties' class='specialties'></optgroup");

  $.map( result.doctors, function( item ) {  
    $('.chzn-select optgroup.doctors').append($('<option></option>').val(item.label).attr("data-type", item.type).attr("data-id", item.id).html(item.value));
  })

  $.map( result.diseases, function( item ) {  
    $('.chzn-select optgroup.diseases').append($('<option></option>').val(item.label).attr("data-type", item.type).attr("data-id", item.id).html(item.value));
  })

  $.map( result.specialities, function( item ) {  
    $('.chzn-select optgroup.specialties').append($('<option></option>').val(item.label).attr("data-type", item.type).attr("data-id", item.id).html(item.value));
  })

  $(".chzn-select").trigger("liszt:updated");
}

 window.autocomplete_select = function() {
  $('.chzn-search input').autocomplete({
    source: function( request, response ) {
      $.ajax({
        url: "http://docawards.com/specialties/autocomplete.json?term=" + request.term + "&jsonp_callback=cbck",
        dataType: "jsonp",
        jsonpCallback: "cbck",
        data: {
            featureClass: "P",
            style: "full",
            maxRows: 12,
        },
        
        beforeSend: function(){
          $('.chzn-select').empty();
          $('ul.chzn-results').empty();

          
        },
        success: function( data ) {
          result = {};
          result.doctors = []; result.diseases = []; result.specialities = [] 
          $.map(data.doctors, function(item) {
              doc = item.Doctor;
              result.doctors.push({
                  label: doc.first_name + " " + doc.last_name,
                  value: doc.first_name + " " + doc.last_name,
                  id: doc.id,
                  type: "doctor"
              });
          });

          $.map(data.diseases, function(item) {
              disease = item.Disease;
              result.diseases.push({
                  label: disease.name,
                  value: disease.name,
                  id: disease.id,
                  type: "disease"
              });
          });

          $.map(data.specialties, function(item) {
              speciality = item.Specialty;
              result.specialities.push({
                  label: speciality.name,
                  value: speciality.name,
                  id: speciality.id,
                  type: "speciality"
              });
          });


          response( render_options(result) )

          
        }

      })
    }
  });

}