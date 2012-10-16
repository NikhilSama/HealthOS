
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
      
      beforeSend: function(){$('ul.chzn-results').empty();},
      success: function( data ) {
        result = [];
        $.map(data.doctors, function(item) {
            doc = item.Doctor;
            result.push({
                label: doc.first_name + " " + doc.last_name,
                value: doc.first_name + " " + doc.last_name,
                id: doc.id,
                type: "doctor"
            });
        });

        $.map(data.diseases, function(item) {
            disease = item.Disease;
            result.push({
                label: disease.name,
                value: disease.name,
                id: disease.id,
                type: "disease"
            });
        });

        $.map(data.specialties, function(item) {
            speciality = item.Specialty;
            result.push({
                label: speciality.name,
                value: speciality.name,
                id: speciality.id,
                type: "speciality"
            });
        });


        response( $.map( result, function( item ) {
            $('ul.chzn-results').append('<li class="active-result">' + item.label +       '</li>');
            $(".chzn-select").trigger("liszt:updated");
        }));
      }

    })
  }
});