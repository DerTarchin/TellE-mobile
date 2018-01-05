/* -------------------------------- *
* Hide/show list bar
* -------------------------------- */
var listbar_pos = '-'+$('.listbar').height()+'px';
$(window).scroll({
      previousTop: 0
  }, 
  function () {
  var currentTop = $(window).scrollTop();
  if (currentTop < this.previousTop) {
      $(".listbar").css('top','0');
  } else {
      $(".listbar").css('top',listbar_pos);
  }
  this.previousTop = currentTop;
});