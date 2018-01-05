var csrf = $("#csrf").val();

// HIDE KEYBOARD AFTER SEARCH /////////////////////////////////////////
$('#search-form').on('submit',function() {
	$('#search-form input').blur();
});

// ADD SHOW/MOVIE /////////////////////////////////////////
$(document).off('click');
$(document).on('click', '.add-media-form', function(e) {
	e.preventDefault();
	e.stopPropagation();

	var added_media = $(this).attr('id'),
	  add_url = $(this).attr('url');
	var trakt_id = $('#' + added_media + ' input[name="media-id"]').val(),
	  type = $('#' + added_media + ' input[name="media-type"]').val();

	$('.info-content .option-container#added-icon').show();
	$('.info-content .option-container#added-icon').removeAttr('onclick');
	$('.info-content .option-container#add-icon').hide();
	$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#add-icon').hide();
	$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#added-icon').show();

	send_data = {
	  trakt_id: trakt_id,
	  type: type,
	  csrfmiddlewaretoken: csrf
	};

	$.ajax({
	url: add_url,   
	data: send_data,
	type: "POST",
	dataType : "json",
	success: function(json) {
	  if (!json.error) {
	  	setTimeout(function(){
    		$('.info-content .option-container#added-icon').attr('onclick', 
	          "if(confirm('Are you sure you want to delete this? It cannot be undone.')) remove_media("
	          + trakt_id + ");");
    		setTimeout(function(){
    			if($('.info-content .option-container#added-icon').is(":visible")) {
					$('.info-content .option-container#added-icon').hide();
					$('.info-content .option-container#to-watch-icon').show();
	    		}
    		}, 3000);
        }, 200);
	  }
	  else {
	  	alert(json.error_messages);
	  	$('.info-content .option-container#added-icon').hide();
		$('.info-content .option-container#add-icon').show();
		$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#add-icon').show();
		$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#added-icon').hide();
	  }
	},
	error: function(xhr, status, errorThrown) {
	    alert("Error: " + errorThrown);
	    $('.info-content .option-container#added-icon').hide();
		$('.info-content .option-container#add-icon').show();
		$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#add-icon').show();
		$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#added-icon').hide();
	},
	complete: function( xhr, status ) {
	  return;
	}
	});
});

// UPDATE SETTINGS FORM /////////////////////////////////////////
$('.navlink').on('click',function() {
	$(".settings-form").submit();
});

$('.settings-form').on('submit', function(e) {
	e.preventDefault();
	e.stopPropagation();

  var post_url = $('.settings-form').attr('url');

  send_data = $(".settings-form").serialize();

  $.ajax({
    url: post_url,   
    data: send_data,
    type: "POST",
    dataType : "json",
    success: function(json) {
      if (json.error) {
      	console.log("ERROR " + json.error_messages);
      }
    },
    error: function(xhr, status, errorThrown) {
        alert("Error: " + errorThrown);
    },
    complete: function( xhr, status ) {
      return;
    }
  });
});

// ADD LIST /////////////////////////////////////////
$('#add-list-option').on('click', function() {
	$('.list-panel').animate({width:'hide'},100);
	var listname = null;
	setTimeout(function() {
		var listname = prompt("Enter a list name:", "");
		var regex = new RegExp("^[a-zA-Z0-9\\-\\s]+$");

		if (listname != null && listname.length <= 30 && regex.test(listname)) {
		    var add_url = $('#add-list-option').attr('url');
			send_data = {
				name: listname,
				csrfmiddlewaretoken: csrf
			};

			$.ajax({
				url: add_url,   
				data: send_data,
				type: "POST",
				dataType : "json",
				success: function(json) {
					if (!json.error) {
						var list_url = $('#list_url').val().replace("listname",json.lists.name),
							custom = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 869 846" enable-background="new 0 0 869 846" xml:space="preserve" class="svg replaced-svg"><g id="_x23_ffffffff"></g><g id="_x23_000000ff">  <path d="M177.6,4.8C188,3.8,198.5,4,209,4c154.3,0,308.7,0,463,0c15.8-0.3,31.7,1,47.1,4.7c33.3,7.8,64.2,25.6,87.7,50.4   c23.3,24.5,39.4,55.7,45.6,89c3.4,16.7,3.2,33.9,3.1,50.8c0,149.3,0,298.7,0,448c-0.1,12.9,0.4,25.9-1.2,38.8   c-4.2,36.2-20,71-44.6,98c-32.6,36.4-80.8,58.1-129.7,58.3c-161.7,0-323.3,0-485,0c-33.6,0.1-67.1-9.5-95.4-27.6   c-27.4-17.4-49.9-42.5-64.2-71.8c-11.8-24.1-18-50.8-17.9-77.6c0-156.3,0-312.7,0-469c0-11-0.3-22.1,0.9-33.1   c3.4-34.1,17.1-67.1,38.8-93.6C86.7,33,131,9.1,177.6,4.8 M179.6,51.9c-33,3.7-64.2,20.7-85.2,46.4c-19.1,23-29.9,52.8-29.8,82.7   c0,156.7,0,313.4,0,470.1c0,10.3-0.3,20.6,1.1,30.8c3.6,28.5,17.2,55.7,37.8,75.8c23.8,23.6,57,37.4,90.6,37.4c153,0,306,0,459,0   c16.4-0.3,32.9,1,49.1-2.2c30.1-5.4,57.9-22,77.2-45.7c18.8-22.9,29.4-52.5,29.3-82.1c0-161.3,0-322.7,0-484   c0.1-28.3-9.5-56.5-26.8-78.9C762.2,76.4,732.8,58.4,701,53c-15.5-2.9-31.3-1.7-47-2c-153,0-306,0-459.1,0   C189.8,51,184.7,51.3,179.6,51.9z"></path>  <path d="M243.5,211.8c4.1-1.1,8.3-0.8,12.5-0.8c121.7,0,243.3,0,365,0c9-0.1,17.8,4.9,22.5,12.5c5.8,9.1,5.2,21.8-1.6,30.2   c-4.9,6.4-12.8,10.3-20.9,10.2c-123.7,0-247.4,0-371,0c-13.3,0.3-25.4-10.9-26.3-24.1C222.2,227.3,231.2,214.7,243.5,211.8z"></path>  <path d="M243.5,334.8c4.4-1.1,8.9-0.7,13.4-0.8c120.7,0,241.4,0,362.1,0c5.1-0.2,10.3,0.8,14.7,3.3c10,5.4,15.7,17.6,13.1,28.8   c-2.3,11.9-13.8,21.2-25.9,20.9c-123.7,0-247.4,0-371,0c-13.3,0.3-25.4-10.9-26.4-24.1C222.2,350.3,231.2,337.7,243.5,334.8z"></path> <path d="M243.6,458.8c4.1-1.1,8.3-0.8,12.5-0.8c121.7,0,243.3,0,365,0c9-0.1,17.8,4.9,22.5,12.6c5.8,9.1,5.1,21.8-1.7,30.2   c-4.9,6.4-12.8,10.3-20.8,10.2c-117,0-234,0-351,0c-7.4-0.1-14.8,0.1-22.2-0.1c-12.8-0.8-23.9-12.1-24.3-25   C222.6,473.6,231.6,461.6,243.6,458.8z"></path>  <path d="M244.4,582.6c2.2-0.5,4.4-0.6,6.6-0.6c123.3,0,246.7,0,370,0c9-0.1,17.7,4.8,22.4,12.4c5.9,9.1,5.3,21.9-1.6,30.4   C637,631.2,629,635.1,621,635c-116,0-232,0-348,0c-8.4-0.1-16.7,0.1-25.1-0.1c-12.8-0.7-23.9-12.1-24.4-25   C222.6,597.3,232,585,244.4,582.6z"></path></g></svg>',
							custom_selected = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 904 848" enable-background="new 0 0 904 848" xml:space="preserve" class="svg replaced-svg"><g id="_x23_ffffffff"></g><g id="_x23_000000ff"> <path d="M189.5,5.6C194.6,5.2,199.8,5,205,5c155.7,0,311.3,0,467,0c11.3,0,22.7-0.3,34,1c34.5,3.5,67.7,17.6,94.3,39.7   c35.1,28.9,58.4,71.8,63.1,117.1c1.5,12.4,1,24.8,1.1,37.2c0,155.7,0,311.3,0,467c-0.1,37.2-12.4,74.1-34.5,104   c-27.1,37-69,62.7-114.4,69.8c-17,3-34.4,2.1-51.6,2.2c-153.7,0-307.3,0-461,0c-35.6,0-71.2-11.2-100.4-31.6   C64.2,784.9,37,742.7,29.2,696.6c-3.7-19.7-2.5-39.7-2.7-59.6c0-151.7,0-303.3,0-455c0-31.7,8.6-63.4,25-90.6   C67.2,65,89.9,42.8,116.7,27.8C139,15.2,164,7.6,189.5,5.6 M253.4,212.6c-5.8,1.2-11,4.5-14.8,9c-7.1,8.2-8.1,21-2.5,30.2   c4.6,8,13.6,13.2,22.8,13.1c123.7,0,247.4,0,371.1,0c13.2,0.3,25.3-10.8,26.3-24c1.2-11.1-5.5-22.4-15.7-26.8   c-5.8-2.8-12.4-2.2-18.7-2.3c-120.7,0-241.4,0-362,0C257.8,212,255.5,212.1,253.4,212.6 M253.4,335.6c-8.1,1.7-15.2,7.5-18.6,15.1   c-2.9,6.5-3,14.2-0.3,20.8c3.1,7.7,10.1,13.7,18.1,15.7c4,1,8.2,0.7,12.4,0.8c121.7,0,243.4,0,365.1,0c10.8,0.2,21.1-7.1,24.7-17.2   c3.2-8.5,1.7-18.6-4-25.6c-4.9-6.3-12.8-10.2-20.8-10.2c-123.4,0-246.7,0-370.1,0C257.8,335,255.5,335.1,253.4,335.6 M253.4,459.6   c-12.4,2.4-21.9,14.8-20.8,27.4c0.5,12.8,11.5,24.2,24.4,24.9c7.7,0.2,15.4,0,23.1,0.1c116.7,0,233.4,0,350.1,0   c13.9,0.3,26.5-12,26.4-26c0.7-14.3-12.1-27.4-26.4-27c-123.4,0-246.7,0-370.1,0C257.8,459,255.5,459.1,253.4,459.6 M253.4,583.6   c-12.8,2.5-22.3,15.5-20.8,28.4c1,13.2,13.1,24.3,26.3,24c123.7,0,247.4,0,371.1,0c14.3,0.4,27.1-12.7,26.4-27   c0.1-13.9-12.5-26.3-26.4-26c-123.4,0-246.7,0-370.1,0C257.8,583,255.5,583.1,253.4,583.6z"></path></g></svg>',
							html = '<a href="' + list_url + '"><div class="list-option">'
	                		+ json.lists.pretty_name + '<div class="list-icon" id="'
	                		+ 'list-' + json.lists.name + '-icon"><style>#list-' 
	                		+ json.lists.name + '-icon {-webkit-mask-image:'
	                		+ 'url(\'data:image/svg+xml;utf8,' + custom + '\');'
	                		+ 'mask-image: url(\'data:image/svg+xml;utf8,' + custom + '\');'
							+ '-webkit-mask-size: 100% 100%;mask-size: 100% 100%;}'
							+ '.list-option.active #list-{{ name }}-icon '
							+ '{-webkit-mask-image: url(\'data:image/svg+xml;utf8,' + custom_selected + '\');'
							+ 'mask-image: url(\'data:image/svg+xml;utf8,' + custom_selected + '\');}'
							+ '</style></div></div></a>',
							html_popup = '<option name="list-' + json.lists.name
							+ '" value="' + json.lists.name + '">' + json.lists.pretty_name
							+ '</option>';
						$(html).insertBefore($('#add-list-option'));
						$(html_popup).insertAfter($(".manage-list-popup option:last"));
					}
					else {
						console.log("ERROR " + json.error_messages);
					}
				},
				error: function(xhr, status, errorThrown) {
					alert("Error: " + errorThrown);
				},
				complete: function( xhr, status ) {
					return;
				}
			});
		}
		else if (listname != null) {
			alert("Invalid: List name must be maximum 30 characters long and can only contain letters, numbers, spaces and dashes.")
		}
	}, 110);
});

// DELETE LIST /////////////////////////////////////////
delete_list = function() {
	var delete_url = $('#delete_list_button').attr('url');
	if($("select[name='manage_list'] option:selected").length == 0)
		return;
	var listname = $( "select[name='manage_list'] option:selected" ).val()
	send_data = {
		name: listname,
		csrfmiddlewaretoken: csrf
	};

	$.ajax({
		url: delete_url,   
		data: send_data,
		type: "POST",
		dataType : "json",
		success: function(json) {
			if (!json.error) {
				$('select[name="default_movie_list"] option[value="'+listname+'"]').remove();
				$('select[name="default_show_list"] option[value="'+listname+'"]').remove();
				$('select[name="manage_list"] option[value="'+listname+'"]').remove();
				
				var color = $('#delete_list_button').css('color'),
					color_grey = 'rgba(0,0,0,0.1)';
				$('#delete_list_button').animate({
		          'color': color_grey,
		          'border-color': color_grey
		        }, 50 );
				// $('#delete_list_button').css('border-color', color_after);
				// $('#delete_list_button').css('color', color_after);
				setTimeout(function(){
					$('#delete_list_button').animate({
			          'color': color,
			          'border-color': color
			        }, 200 );
					// $('#delete_list_button').css('border-color', color_before);
					// $('#delete_list_button').css('color', color_before);
				},500);
			}
			else {
				console.log("ERROR " + json.error_messages);
			}
		},
		error: function(xhr, status, errorThrown) {
			alert("Error: " + errorThrown);
		},
		complete: function( xhr, status ) {
			return;
		}
	});
};

// MANAGE LISTS FROM POPUP /////////////////////////////////////////
$manage = $('.manage-list-popup');

manage_list = function(list_name, trakt_id) {

  var manage_url = $manage.attr('url');

  send_data = {
      name: list_name,
      trakt_id: trakt_id,
      csrfmiddlewaretoken: csrf
  };

  $.ajax({
    url: manage_url,   
    data: send_data,
    type: "POST",
    dataType : "json",
    success: function(json) {
      if (!json.error) {
          if($('.grid-item[trakt_id="'+trakt_id+'"]').hasClass(list_name)) {
		  	$('.grid-item[trakt_id="'+trakt_id+'"]').removeClass(list_name);
		  	$('#log').append("<br>"+json.error_messages+" REMOVED "+list_name+" to "+trakt_id);
		  }
		  else {
		  	$('.grid-item[trakt_id="'+trakt_id+'"]').addClass(list_name);
		  	$('#log').append("<br>"+json.error_messages+" ADDED "+list_name+" to "+trakt_id);
		  }
      }
      else 
        console.log("JSON ERROR STATUS: " + json.error);
    },
    error: function(xhr, status, errorThrown) {
        alert("Error: " + errorThrown);
    },
    complete: function( xhr, status ) {
      return;
    }
  });
}

$original_selected = [];
var timerId = 0;
$manage.hide();

log = function(text) { $("#log").append(text); };

checkChanges = function(trakt_id) {
	$current_set = [];
	$(".manage-list-popup[trakt_id='"+trakt_id+"'] option:not([ignore]):selected").each(function () {
	   $current_set.push($(this).val());
	});
	$changed = [];
	for(var i=0; i<$current_set.length; i++) 
		if ($original_selected.indexOf($current_set[i]) < 0) 
			$changed.push($current_set[i]);
	for(var i=0; i<$original_selected.length; i++)
		if ($current_set.indexOf($original_selected[i]) < 0)
			$changed.push($original_selected[i]);

	$original_selected = $current_set;

	if($changed.length > 0)
		for(var i=0; i<$changed.length; i++) 
			manage_list($changed[i], $manage.attr('trakt_id'));
}

$prev_trakt_id = null;
$("#log").hide();
showListManager = function(trakt_id) {
	clearInterval(timerId);
	if($prev_trakt_id != null) checkChanges($prev_trakt_id);
	var $master_filters = $('#master-filters').attr('class').split(" ");
	var $filters = $('.grid-item[trakt_id="'+trakt_id+'"]').attr('class').split(" ");

	// clear previous selections from popup
	$('.manage-list-popup option').removeAttr("selected");
	$manage_lists = [];
	$manage_lists.push($('.manage-list-popup option').detach());
	$manage.detach().insertAfter($('.options-icon[trakt_id="'+trakt_id+'"]'));
	for(var i=0; i< $manage_lists.length; i++) $manage.append($manage_lists[i]);
	$manage.hide();
	$manage.attr('trakt_id', trakt_id);
	$original_selected = [];

	// mark all lists the item is in
	for (var i = 0; i < $filters.length; i++)
	  for(var j=0; j< $master_filters.length; j++)
	    if($filters[i] == $master_filters[j] && $filters[i].length > 0) {
			$('.manage-list-popup[trakt_id="'+trakt_id+'"] option[name="list-'+$filters[i]+'"]').prop('selected', true);
			if (['to-watch', 'watched', 'watching', 'all'].indexOf($filters[i]) < 0) 
				$original_selected.push($filters[i]);
	    }

	   timerId = setInterval(function () { checkChanges(trakt_id); }, 1000);

	$prev_trakt_id = trakt_id;

	$manage.show();
	$manage.focus();
	$manage.hide();
}

// MANAGE WATCHED MOVIE /////////////////////////////////////////
mark_watched_movie = function(trakt_id) {
  var manage_url = $('#manage_list_url').val();
  var watched = $('.grid-item[trakt_id="'+trakt_id+'"]').hasClass('watched');
  if($('.info-content').length)
  	watched = $('.info-content .option-container#watched-icon').is(":visible"); 
  var curr_list = "watched";
  if(watched)
    curr_list = "to-watch";

	if (curr_list == "watched") {
		$('.grid-item[trakt_id="'+trakt_id+'"]').removeClass("to-watch");
		$('.grid-item[trakt_id="'+trakt_id+'"]').addClass("watched");
		$('.grid-info[trakt_id="'+trakt_id+'"] #to-watch-item-icon').hide();
		$('.grid-info[trakt_id="'+trakt_id+'"] #watched-item-icon').show();
		$('.info-content .option-container#to-watch-icon').hide();
		$('.info-content .option-container#watched-icon').show();
	}
	// cur_list is "to-watch"
	else {
		$('.grid-item[trakt_id="'+trakt_id+'"]').removeClass("watched");
		$('.grid-item[trakt_id="'+trakt_id+'"]').addClass("to-watch");
		$('.grid-info[trakt_id="'+trakt_id+'"] #to-watch-item-icon').show();
		$('.grid-info[trakt_id="'+trakt_id+'"] #watched-item-icon').hide();
		$('.info-content .option-container#to-watch-icon').show();
		$('.info-content .option-container#watched-icon').hide();
	}

  send_data = {
      name: curr_list,
      trakt_id: trakt_id,
      csrfmiddlewaretoken: csrf
  };

  $.ajax({
    url: manage_url,   
    data: send_data,
    type: "POST",
    dataType : "json",
    success: function(json) {
      if (json.error) {
	      	alert(json.error_messages);
          if (curr_list == "watched") {
            $('.grid-item[trakt_id="'+trakt_id+'"]').removeClass("watched");
            $('.grid-item[trakt_id="'+trakt_id+'"]').addClass("to-watch");
            $('.grid-info[trakt_id="'+trakt_id+'"] #to-watch-item-icon').show();
            $('.grid-info[trakt_id="'+trakt_id+'"] #watched-item-icon').hide();
            $('.info-content .option-container#to-watch-icon').show();
			$('.info-content .option-container#watched-icon').hide();
          }
          // cur_list is "to-watch"
          else {
          	$('.grid-item[trakt_id="'+trakt_id+'"]').removeClass("to-watch");
            $('.grid-item[trakt_id="'+trakt_id+'"]').addClass("watched");
            $('.grid-info[trakt_id="'+trakt_id+'"] #to-watch-item-icon').hide()
            $('.grid-info[trakt_id="'+trakt_id+'"] #watched-item-icon').show();
            $('.info-content .option-container#to-watch-icon').hide();
			$('.info-content .option-container#watched-icon').show();
          }
      }
      else 
        console.log("JSON ERROR STATUS: " + json.error);
    },
    error: function(xhr, status, errorThrown) {
		alert("Error: " + errorThrown);
		if (curr_list == "watched") {
            $('.grid-item[trakt_id="'+trakt_id+'"]').removeClass("watched");
            $('.grid-item[trakt_id="'+trakt_id+'"]').addClass("to-watch");
            $('.grid-info[trakt_id="'+trakt_id+'"] #to-watch-item-icon').show();
            $('.grid-info[trakt_id="'+trakt_id+'"] #watched-item-icon').hide();
            $('.info-content .option-container#to-watch-icon').show();
			$('.info-content .option-container#watched-icon').hide();
          }
          // cur_list is "to-watch"
          else {
          	$('.grid-item[trakt_id="'+trakt_id+'"]').removeClass("to-watch");
            $('.grid-item[trakt_id="'+trakt_id+'"]').addClass("watched");
            $('.grid-info[trakt_id="'+trakt_id+'"] #to-watch-item-icon').hide()
            $('.grid-info[trakt_id="'+trakt_id+'"] #watched-item-icon').show();
            $('.info-content .option-container#to-watch-icon').hide();
			$('.info-content .option-container#watched-icon').show();
		}
    },
    complete: function( xhr, status ) {
      return;
    }
  });
};

// REMOVE MEDIA /////////////////////////////////////////
remove_media = function(trakt_id) {
  var csrf = $("#csrf").val();
  rem_url = $('#remove_media_url').val();

  console.log("removing "+trakt_id);

  send_data = {
      trakt_id: trakt_id,
      csrfmiddlewaretoken: csrf
  };
  
  $.ajax({
      url: rem_url,
      data: send_data,
      type: "POST",
      dataType : "json",
      success: function(json) {
        if (!json.error) {
        	if($('.search').length) {
        		$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#add-icon').show();
				$('.grid-info[trakt_id="'+trakt_id+'"] .grid-info-button#added-icon').hide();
        	}
        	else {
        		$('.grid-info').hide("blind", 200);
	        	$('.grid-item').removeAttr('show_delete');
	        	$('.grid-item .overlay svg').removeAttr('onclick');
				$('.grid-item[trakt_id="'+trakt_id+'"]').attr("disabled", "disabled").off('click mousedown');
				$('.grid-item[trakt_id="'+trakt_id+'"]').fadeTo("slow" , 0.2);
				$('.grid-item').removeAttr('show_delete');
				$('.info-content .option-container#added-icon').hide();
				$('.info-content .option-container#add-icon').show();
        	}
        	
        }
        else
          console.log("error");
      },
      error: function(xhr, status, errorThrown) {
          alert("Error: " + errorThrown);
      },
      complete: function( xhr, status ) {
        return;
      }
  });
};
