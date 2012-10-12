jQuery(document).ready(function($) {
  $(document).foundationTopBar();
  $(document).foundationCustomForms();
  for(var i=1; i <= 4; i++) {
    $('.share_options_' + i).PieMenu({
      'starting_angel':0,
      'angel_difference' : 90,
      'radius':100,
    });
  }



  
  


});

