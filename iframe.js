// Dynamically load a javascript file.
var jssrcLoad = function(src, getObject, callback) {
  var object = getObject();
  if (typeof object == 'undefined') {
    var tag = document.createElement('script');
    tag.src = src;
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    setTimeout(function tryAgain() {
      object = getObject();
      if (typeof object == 'undefined') {
        setTimeout(tryAgain, 200);
      } else if (callback) {
        callback(object);
      }
    }, 200);
  } else if (callback) {
    callback(object);
  }
};

var windowProxy = null;

(function() {
  var doc = null;
  doc = setTimeout(
      function() {
        if (document.body) {
          // TODO: Add loading elements here.
          // hide the document while we load scripts and format
          document.body.style.display = 'none';
          window.clearTimeout(doc);

          // Add jQuery and Porthole libs to document
          // Load jQuery.
          jssrcLoad(
              'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
              function() {
                return window['jQuery'];
              },
              function($) {
                executeApp();
                // Ensure Porthole is loaded and execute
                jssrcLoad(
                    'https://raw.github.com/ternarylabs/porthole/master/src/porthole.min.js',
                    function() {
                      return window['Porthole'];
                    },
                    function(Porthole) {
                      // send document stats via porthole message
                      // Create a proxy window to send to and receive
                      // messages from the parent
                      windowProxy = new Porthole.WindowProxy(
                          'https://www.allplayers.com/sites/all/libraries/porthole/src/proxy.html');
                      // Register an event handler to receive messages;
                      windowProxy.addEventListener(function(event) {
                        // handle event
                      });
                      setTimeout((function() {
                        windowProxy.post({
                          'height' : $('html').height(),
                          'id' : window.location.hash
                        });
                      })(), 2000);
                    });
                // unhide the document now that we have set everything up
                document.body.style.display = '';
              });
        }
      }, 200);
})();

executeApp = function() {
  var hash = window.location.hash;
  if (hash) {
    // Cleanup common page items not needed
    $('.leaguemsg').hide();
    $('body > a').hide();
    $('body > div').hide();
    $('body > table').hide();
    // $('body > div > table').parent().show();
    $('body > img').hide();
    $('br').remove();
    // TODO: Rewrite URL's with API lookup callback.
    $('a').attr('target', '');
    $('a').attr('href', hash);

    switch (hash) {
    case "#apci_qs_scheduler_bracket":
      $('body > div > table').parent().show();
      $('.ScheduleSectionHeader').each(function(table) {
        if ($('.ScheduleSectionHeader', table).html() == 'Playoff Bracket') {
          $('.ScheduleSectionHeader', table).parent().hide();
        }
      });
      break;
    case "#apci_qs_scheduler_standings":
      $('table.standings').show();
      $('.ScheduleSectionHeader').hide();
      $('table.standings').css('width', '100%');
      break;
    case "#apci_qs_scheduler_season_schedule_results":
      $('.ScheduleSectionHeader').each(function(table) {
        if ($(this).html() == 'Schedule &amp; Results') {
          $(this).parent().hide();
          $(this).parent().parent().parent().show();
        }
      });
      break;
    }
  }
};
