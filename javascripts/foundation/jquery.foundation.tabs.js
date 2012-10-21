;(function ($, window, undefined) {
  'use strict';

  $.fn.foundationTabs = function (options) {

    var settings = $.extend({
      callback: $.noop
    }, options);

    var activateTab = function ($tab) {
      var $activeTab = $tab.closest('dl').find('dd.active'),
          href = $tab.children('a').attr("href"),
          hasHash = /^#/.test(href),
          contentLocation = '',
          target = '';

          if(href) {
            target = href.split("/")[1]
          }

      if (hasHash) {

        contentLocation = "#" + target + 'Tab';
        // Strip off the current url that IE adds
        contentLocation = contentLocation.replace(/^.+#/, '#');

        //Show Tab Content
        $(contentLocation).closest('.tabs-content').children('li').removeClass('active').hide();
        $(contentLocation).css('display', 'block').addClass('active');
        window.app.createProfileTab(target)
      }

      //Make Tab Active
      $activeTab.removeClass('active');
      $tab.addClass('active');
    };

    $(document).on('click.fndtn', 'dl.tabs dd a', function (event){
      activateTab($(this).parent('dd'));
      window.app.navigate($(this).attr("href"), false);
    });

    if (window.location.hash) {
      activateTab($('a[href="' + window.location.hash + '"]').parent('dd'));
      settings.callback();
    }

  };

})(jQuery, this);
