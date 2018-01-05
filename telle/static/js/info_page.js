function getDistanceFromTop(el) {
    if (typeof jQuery === "function" && el instanceof jQuery)
        el = el[0];
    var rect = el.getBoundingClientRect();
    return rect.top
}

$(document).ready(function() {  

    if($('.intro-person').length == 0) {
      /* -------------------------------- *
       * Set/limit scrolling behavior
       * -------------------------------- */
      $intro = $('.info-intro');
      $content = $('.info-content')

      // $content.addClass('transition');

      $(function() {
        $intro.swipe( { swipeUp:showContent, allowPageScroll:"none"} );
        function showContent(event, direction, distance, duration, fingerCount) {
          $("html, body").animate({ scrollTop: $content.offset().top }, 150);
        }
      });

      $('.info-banner .info-arrow').on('click', function() {
        $("html, body").animate({ scrollTop: $content.offset().top }, 150);
      });

      $('.info-intro, .info-content:not(.info-person)').on('touchend mouseup touchcancel', function() {
        var win_h = $(window).height()/3;
        var dist = getDistanceFromTop($('.info-content'));
        var dist2 = getDistanceFromTop($('.info-intro'));
        if(dist > 0 && dist2 != 0) {
          $(document).bind('scroll',function () { 
            window.scrollTo(window.pageXOffset,window.pageYOffset);
          });
          $(document).unbind('scroll'); 
          setTimeout(function() {
            dist = getDistanceFromTop($('.info-content'));
            if(dist < win_h)
              $("html, body").animate({ scrollTop: $content.offset().top }, 100);
            else
              $("html, body").animate({ scrollTop: $intro.offset().top }, 150);
          }, 5);
        }
      });
    }

    $('.scroll-item').on('click', function(){
      $person_url = $(this).attr('url');
      $hidden_link = $('#hidden-link');
      $hidden_link.attr('href',$person_url);
      $hidden_link.click();
    });

    /* -------------------------------- *
     * Refresh lazyloader
     * -------------------------------- */
    $('.person-scroll').on('touchstart touchend touchmove mousedown mouseup click', function() {
      $(window).trigger("scroll");
    });

    $('.person-scroll').on('touchend mouseup', function() {
      setTimeout(function() { $(window).trigger("scroll");}, 500);
    }) 

    setTimeout(function() { $(window).trigger("scroll"); }, 250);

    /* -------------------------------- *
    * Share features
    * -------------------------------- */
    // IMPORTANT**** this is hardcoded, needs updating 
    // if URLS.py is updated or website host is changed
    $URL = 'http://telle-mobile.herokuapp.com/info/'+$('#info_page_url').val();
    $('.share-fb a').attr('href', $('.share-fb a').attr('href') 
                    + encodeURIComponent($URL));
    $('.share-tw a').attr('href', $('.share-tw a').attr('href') 
          + encodeURIComponent($URL) + '&text=' 
                    + encodeURI($('.share-tw a').attr('text')));
    $('.share-gp a').attr('href', $('.share-gp a').attr('href') 
                    + encodeURIComponent($URL));
    $('.share-em a').attr('href', $('.share-em a').attr('href') 
                                        + $URL);
    $('section.share').hide();
    $('.option-container#share').on('click', function() {
      $('.option-container#share_selected').show();
      $(this).hide();
      $('section.share').show("blind", 200);

      if($('.info-person').length == 0)
        setTimeout(function() {
          // reset intro for glitch
          $('.info-poster').hide();
          setTimeout(function() {
            $('.info-poster').show();
          }, 0);
        }, 200);
    });

    $('.option-container#share_selected').on('click', function() {
      $('.option-container#share').show();
      $(this).hide();
      $('section.share').hide("blind", 200);

      if($('.info-person').length == 0)
        setTimeout(function() {
          // reset intro for glitch
          $('.info-poster').hide();
          setTimeout(function() {
            $('.info-poster').show();
          }, 0);
        }, 200);
    });
});
