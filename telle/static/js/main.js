$.mobile.loadingMessage = false;
$.mobile.loading( "hide" );
$.mobile.loading().hide();
$( document ).on( "mobileinit", function() {
    $.mobile.loader.prototype.options.disabled = true;
    $.mobile.ignoreContentEnabled=true;
});

$(function() {
    FastClick.attach(document.body);
});

// $(window).on("swiperight", function() {
//   parent.history.back();
//   return false;
// });

$(document).bind("mobileinit", function () {
  $.event.special.tap.tapholdThreshold = 500;
});

jQuery(function($) {
  $(document).ready(function() {

    // sudo-lock browser to portrait mode
    // http://stackoverflow.com/questions/1207008/how-do-i-lock-the-orientation-to-portrait-mode-in-a-iphone-web-application
    function reorient(e) {
      var portrait = (window.orientation % 180 == 0);
      if(!portrait)
        alert("For best experience please keep phone vertically oriented.");
      // $("body > div").css("-webkit-transform", !portrait ? "rotate(-90deg)" : "");
    }
    window.onorientationchange = reorient;
    // window.setTimeout(reorient, 0);

    if($('.list-panel').length) {
      // show/hide list panel
      var list_panel_hidden = true;
      $(window).on( "swiperight", function() {
        $('.list-panel').animate({width:'show'},100);
        $('.grid-info').hide("blind", 200);
        $('.grid-item').removeAttr('show_delete');
        $('.grid-item .overlay svg').removeAttr('onclick');
        list_panel_hidden = false;
      });
      $(window).on( "swipeleft", function() {
        $('.list-panel').animate({width:'hide'},100);
        list_panel_hidden = true;
      });
      $(document).on('mousedown',function (e) {
        if (!$('.list-panel').is(e.target) 
          && $('.list-panel').has(e.target).length === 0) {
          $('.list-panel').animate({width:'hide'},100);
          list_panel_hidden = true;
        }
      });
    }

    //focus on search if exists
    // var focus_on_search_input = true;
    // if($('.search').length) {
    //   $('.search').on('touchstart', function() {
    //     if(focus_on_search_input) {
    //       console.log("CLICKING TOUCHIGN");
    //       $('#search-form input').click().focus();
    //       window.scrollTo(0,0);
    //       focus_on_search_input = false;
    //       $('.search').off('touchstart');
    //     }
    //   })
    //   setTimeout(function() { 
    //     $('.search').trigger('touchstart'); 
    //     console.log("searching");
    //   }, 550);
    // }
    
    /* -------------------------------- *
     * Initialize filters with isotope
     * -------------------------------- */
    var $win = $(window),
      $grid = $('.grid'),
      $default_filter = $('.filters .active').attr('data-filter');

    $grid.isotope({
      itemSelector: '.filter-item',
    });

    // $grid.on('layoutComplete', function() {
    //   $win.trigger("scroll");
    // });

    // // hash of functions that match data-filter values
    // var filterFns = {};

    // // filter based on clicked link
    // $('.filters').on('click', '.filter', function() {
    //   var filterValue = $(this).attr('data-filter');
    //   // use filter function if value matches
    //   filterValue = filterFns[filterValue] || filterValue;
    //   $grid.isotope({
    //     filter: filterValue
    //   });
    // });

    // // change is-checked class on buttons
    // $('.filters').each(function(i, filters) {
    //   var $filterGroup = $(filters);
    //   $filterGroup.on('click', '.filter', function() {
    //     $filterGroup.find('.active').removeClass('active');
    //     $(this).addClass('active');
    //   });
    // });

    /* -------------------------------- *
     * Convert svg files to inline svg
     * -------------------------------- */
    $('img.svg').each(function() {
      var $img = jQuery(this);
      var imgID = $img.attr('id');
      var imgClass = $img.attr('class');
      var imgURL = $img.attr('src');

      jQuery.get(imgURL, function(data) {
        var $svg = jQuery(data).find('svg');
        if (typeof imgID !== 'undefined')
          $svg = $svg.attr('id', imgID);
        if (typeof imgClass !== 'undefined')
          $svg = $svg.attr('class', imgClass + ' replaced-svg');
        $svg = $svg.removeAttr('xmlns:a');
        $img.replaceWith($svg);
      });
    });

    /* -------------------------------- *
     * Load imgages with lazyload
     * -------------------------------- */
    $(function() {
      $("img.lazy").lazyload({
        effect: "fadeIn",
        failure_limit: Math.max($("img.lazy").length - 1, 0),
        effectspeed: 500,
        threshold: 100
      });
    });
    window.addEventListener("load", function() {
      for (var i = 0; i < 500; i += 50)
        setTimeout(triggerScroll, i);
      setTimeout(triggerScroll, 10000);
    }, false);
    triggerScroll = function() {
      $win.trigger("scroll");
    }

    /* -------------------------------- *
     * Define smoothstate.js behavior
     * -------------------------------- */
    var loading_html = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" xml:space="preserve" class="loading-icon"><path d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"></path></svg>';
    $(function() {
      'use strict';
      var $page = $('#main'),
        options = {
          debug: true,
          prefetch: true,
          cacheLength: 0,
          forms: 'form',
          onBefore: function($currentTarget, $container) {
              if($("#"+$currentTarget.parent().attr('id')+" svg").length != 0)
                $("#"+$currentTarget.parent().attr('id')+" svg").replaceWith(loading_html);
              else if($('#search-form').length != 0)
                $('#navlink_search svg').replaceWith(loading_html);
              else
                $('#navlink_media svg').replaceWith(loading_html);
              $('.list-panel').animate({width:'hide'},100);
          },
          onStart: {
            duration: 350,
            render: function($container) {
                $container.addClass('is-exiting');
                $('.list-panel').animate({width:'hide'},100)
                smoothState.restartCSSAnimations();
            }
          },
          onReady: {
            duration: 0,
            render: function($container, $newContent) {
                $container.removeClass('is-exiting');
                $container.html($newContent);
                for (var i = 0; i < 500; i += 50)
                    setTimeout(triggerScroll, i);
                setTimeout(triggerScroll, 10000);
            }
          }
        },
        smoothState = $page.smoothState(options).data('smoothState');
    });

    /* -------------------------------- *
     * Grid Item
     * -------------------------------- */
    var lastGridItem = "";
    $('.grid-item').on('click',function(e) {
      if($(this).attr("type") == "person" || 
        $(this)[0].hasAttribute('show_delete')) 
        return $('.grid-info').hide("blind", 200);
      var trakt_id = $(this).closest('.grid-item').attr('trakt_id');
      var info_div = '<div class="col-xs-12 nopadding grid-info" trakt_id="'
        + trakt_id + '"></div>';

      // dont pre-hide it if current id
      if(lastGridItem != trakt_id)
        $('.grid-info').hide("blind", 200);

      // check if previously generated, show/hide it
      if($('.grid-info[trakt_id="'+trakt_id+'"]').length)
        $('.grid-info[trakt_id="'+trakt_id+'"]').toggle("blind", 200);
      // otherwise generate and show new
      else {
        $(info_div).insertAfter($(this).closest('.row')).show("blind", 200);
        $('.grid-info[trakt_id="'+trakt_id+'"]').append($('.grid-info-contents[trakt_id="' + trakt_id +'"]').html());
        // console.log($('.grid-info-contents[trakt_id="' + trakt_id +'"]').html());
      }
      lastGridItem = trakt_id;

      var el = $( e.target );
      var elOffset = el.offset().top;
      var elHeight = el.height();
      var windowHeight = $(window).height();
      var offset;
      if (elHeight < windowHeight) 
        offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
      else 
        offset = elOffset;
      $('html, body').animate({scrollTop:offset}, 200);
    });

    /* -------------------------------- *
     * Show Delete Overlay
     * -------------------------------- */
     // on click of any grid item, hide delete sign unless is $(this)
    $('.grid-item').on("mousedown click touchstart",function() {
      if(!$(this)[0].hasAttribute('show_delete')) {
        $('.grid-item').removeAttr('show_delete');
        $('.grid-item .overlay svg').removeAttr('onclick');
      }
     });

    $('.grid-item').on("taphold",function() {
      $('.grid-info').hide("blind", 200);
      if(!$(this)[0].hasAttribute('show_delete')) {
        $('.grid-item').removeAttr('show_delete');
        $('.grid-item .overlay svg').removeAttr('onclick');
      }
      trakt_id = $(this).attr('trakt_id');
      $('.grid-item .overlay svg').removeAttr('onclick');
      $('.grid-item[trakt_id="'+trakt_id+'"]').attr('show_delete',"");
      $('.grid-item[trakt_id="'+trakt_id+'"]').on('mouseup touchend', function() {
        setTimeout(function(){
            $('.grid-item[trakt_id="'+trakt_id+'"] .overlay svg').attr('onclick', 
              "if(confirm('Are you sure you want to delete this? It cannot be undone.')) remove_media("
              + $(this).attr('trakt_id') + ");");
        },200);
      });
    });

    // click on person item
    $('.grid-item[type="person"]').on('click', function() {
      $person_url = $(this).attr('url');
      $hidden_link = $('#hidden-link');
      $hidden_link.attr('href',$person_url);
      $hidden_link.click();
    });

  });
});
