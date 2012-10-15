/* --------------------------------------------
 * DocAwards v1.0
 * URL: http://docawards.com
 * Author: Bharani Muthukumaraswamy <bharani91@gmail.com>
 * Author URL: http://abhayam.co.in
 --------------------------------------------*/

(function( $ ) {
    $.widget( "ui.combobox", {
        _create: function() {
            var input,
                that = this,
                select = this.element.hide(),
                selected = select.children( ":selected" ),
                value = selected.val() ? selected.text() : "",
                wrapper = this.wrapper = $( "<span>" )
                    .addClass( "ui-combobox" )
                    .insertAfter( select );

            function removeIfInvalid(element) {
                var value = $( element ).val(),
                    matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( value ) + "$", "i" ),
                    valid = false;
                select.children( "option" ).each(function() {
                    if ( $( this ).text().match( matcher ) ) {
                        this.selected = valid = true;
                        return false;
                    }
                });
                if ( !valid ) {
                    // remove invalid value, as it didn't match anything
                    $( element )
                        .val( "" )
                        .attr( "title", value + " didn't match any item" )
                        .tooltip( "open" );
                    select.val( "" );
                    setTimeout(function() {
                        input.tooltip( "close" ).attr( "title", "" );
                    }, 2500 );
                    input.data( "autocomplete" ).term = "";
                    return false;
                }
            }

            input = $( "<input>" )
                .appendTo( wrapper )
                .val( value )
                .attr( "title", "" )

                .addClass( "ui-state-default ui-combobox-input twelve columns select_input" )
                .autocomplete({
                    delay: 0,
                    minLength: 0,
                    source: function(request, response) {
                        console.log(request);
                          $.ajax({
                              url: "http://docawards.com/specialties/autocomplete.json?term=" + request.term + "&jsonp_callback=cbck",
                              dataType: "jsonp",
                              jsonpCallback: "cbck",
                              data: {
                                  featureClass: "P",
                                  style: "full",
                                  maxRows: 12,
                              },
                              success: function(data) {
                                  result = [];
                                  $.map(data.doctors, function(item) {
                                      doc = item.Doctor;
                                      result.push({
                                          label: doc.first_name + " " + doc.last_name,
                                          value: doc.first_name + " " + doc.last_name,
                                          type: "doctor"
                                      });
                                  });

                                  $.map(data.diseases, function(item) {
                                      disease = item.Disease;
                                      result.push({
                                          label: disease.name,
                                          value: disease.name,
                                          type: "disease"
                                      });
                                  })

                                  response(result);

                                  

                                  // response($.map(data.specialties, function(item) {
                                  //     specialty = item.specialty;
                                  //     return {
                                  //         label: specialty.name,
                                  //         value: specialty.name
                                  //     }
                                  // }));
                                  
                              }
                          })
                      },
                    select: function( event, ui ) {
                        // ui.item.option.selected = true;
                        that._trigger( "selected", event, {
                            item: ui.item.label
                        });
                        console.log(ui.item);
                        
                    },
                    change: function( event, ui ) {
                        if ( !ui.item )
                            return removeIfInvalid( this );
                    }
                })
                .addClass( "ui-widget ui-widget-content ui-corner-left" );

            input.data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a>" + item.label + " <small>(" + item.type + ")</small></a>" )
                    .hover(function() {
                      console.log("Show description");
                    }, function() {
                      console.log("Hide description");
                    })
                    .appendTo( ul );
            };

            // $( "<a>" )
            //     .attr( "tabIndex", -1 )
            //     .attr( "title", "Show All Items" )
            //     .tooltip()
            //     .appendTo( wrapper )
            //     .button({
            //         icons: {
            //             primary: "ui-icon-triangle-1-s"
            //         },
            //         text: false
            //     })
            //     .removeClass( "ui-corner-all" )
            //     .addClass( "ui-corner-right ui-combobox-toggle" )
            //     .click(function() {
            //         // close if already visible
            //         if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
            //             input.autocomplete( "close" );
            //             removeIfInvalid( input );
            //             return;
            //         }

            //         // work around a bug (likely same cause as #5265)
            //         $( this ).blur();

            //         // pass empty string as value to search for, displaying all results
            //         input.autocomplete( "search", "" );
            //         input.focus();
            //     });

                input
                    .tooltip({
                        position: {
                            of: $(".collapse"),
                            at: "left bottom",
                            my: "left top"
                        },
                        tooltipClass: "ui-state-error"
                    });
        },

        destroy: function() {
            this.wrapper.remove();
            this.element.show();
            $.Widget.prototype.destroy.call( this );
        }
    });
})( jQuery );
 
    $(function() {
        $( "#combobox" ).combobox();
        $( "#toggle" ).click(function() {
            $( "#combobox" ).toggle();
        });
    });