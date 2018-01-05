from django.shortcuts import render, redirect, get_object_or_404
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.contrib.auth.models import User
from django.contrib.auth import login as auth_login, authenticate, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.staticfiles.templatetags.staticfiles import static
from datetime import datetime
from django.utils import formats

import time, requests, json, urllib
from time import *
from django.core.cache import caches
from django.db import transaction
from hashlib import sha1 as sha_constructor
from xml.etree import ElementTree

from telle.models import *
from telle.forms import *

CLIENT_ID = "4a441871572e1939a9421e9138c6a5a95dcd1ac4776d71818590ef521e0b6110"
CLIENT_SECRET = "215d5f7969c36a06735ba85abae86f8e2c2b4bfc35eff64e9aca1f7a5a5da8b3"
REDIRECT_URI = "http://localhost:8000/token"

################### TESTING #######################
import random 
shows_example = [{
    "title":"The Walking Dead",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/001/393/posters/thumb/dec5cd226c.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/001/393/fanarts/original/fc68b3b649.jpg"
}, 
{
    "title":"11.22.63",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/102/771/posters/thumb/e9cfb8f315.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/102/771/fanarts/original/3c06324bd8.jpg"
}, 
{
    "title":"Shameless",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/034/160/posters/thumb/0fed195982.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/034/160/fanarts/original/c04bebba45.jpg"
},
{
    "title":"Marvel's Daredevil",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/077/938/posters/thumb/2d62b7fe39.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/077/938/fanarts/original/caf0eacd29.jpg"
},
{
    "title":"Better Call Saul",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/059/660/posters/thumb/a847b27956.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/059/660/fanarts/original/5885092434.jpg"
},
{
    "title":"The Big Bang Theory",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/001/409/posters/thumb/8adfe77938.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/001/409/fanarts/original/cff0b01ee7.jpg"
},
{
    "title":"House of Cards",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/001/416/posters/thumb/d157e5bbb2.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/001/416/fanarts/original/28b9159c81.jpg"
},
{
    "title":"Game of Thrones",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/001/390/posters/thumb/93df9cd612.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/001/390/fanarts/original/76d5df8aed.jpg"
},
{
    "title":"Arrow",
    "trakt_id":random.randint(1,1000),
    "poster_url":"https://walter.trakt.us/images/shows/000/001/403/posters/thumb/e68cd618e2.jpg",
    "fanart_url":"https://walter.trakt.us/images/shows/000/001/403/fanarts/original/bbe10773b5.jpg"
}]
################### TESTING #######################


blacklisted_listnames = ["col-xs-4", "nopadding", "poster", "fanart", "grid-item", "watched",
"watching", "to-watch", "all"]

@transaction.atomic
def register(request):
    context = {
        "register_form" : RegisterForm()
    }
    if request.method != "POST":
        return render(request, "register.html", context)

    form = RegisterForm(request.POST)
    context["register_form"] = form

    if not form.is_valid():
        return render(request, "register.html", context)

    user = User.objects.create_user(username=form.cleaned_data["email"],
        email=form.cleaned_data["email"], first_name=form.cleaned_data["first_name"], 
        password=form.cleaned_data["password"])
    user.save()

    # user_settings = Settings.objects.create_settings(user=user);
    user_settings = Settings(user=user)
    user_settings.save()

    # Default lists
    all_list = List(user=user,name="all",pretty_name="All",type="default")
    all_list.save()
    fav_list = List(user=user,name="favorites",pretty_name="Favorites",type="default")
    fav_list.save()
    watch_list = List(user=user,name="to-watch",pretty_name="To Watch",type="default")
    watch_list.save()
    watching_list = List(user=user,name="watching",pretty_name="Watching",type="default")
    watching_list.save()
    watched_list = List(user=user,name="watched",pretty_name="Watched",type="default")
    watched_list.save()

    # log in the user upon registration
    user = authenticate(username=form.cleaned_data["email"],
                        password=form.cleaned_data["password"])
    auth_login(request, user)
    return home(request)

# @login_required
@transaction.atomic
def delete_account(request):
    if request.user.is_authenticated():
        username = request.user.username
        auth_logout(request)
        User.objects.get(username=username).delete()
    return HttpResponseRedirect(reverse("register"))

@login_required
def home(request):
    if request.user.settings.default_home_page == "movies":
        return HttpResponseRedirect(reverse('movies', 
            args=[request.user.settings.default_movie_list]))
    else:
        return HttpResponseRedirect(reverse('shows', 
            args=[request.user.settings.default_show_list]))

@transaction.atomic
@login_required
def settings(request):
    lists = List.objects.filter(user=request.user).order_by('id')
    context = { 'lists' : lists }
    if request.method == "POST":
        response_text = { "error" : True }
        settings = request.user.settings
        settings_form = SettingsForm(request.POST, instance=settings)
        if settings_form.is_valid():
            response_text["error_messages"] = []
            response_text["error"] = False
            settings_form.save()
        else:
            response_text["error_messages"] = "An error has occured"
        return HttpResponse(json.dumps(response_text), content_type='application/json')
    return render(request, 'settings.html', context)

def policy(request):
    return render(request, 'privacy.html', {})

@transaction.atomic
@login_required
def add_list(request):
    response_text = { "error" : True, "error_messages": "Invalid name" }
    if request.method == "POST":
        if request.POST['name']:
            pretty_name = request.POST['name']
            name = pretty_name.lower().replace(" ", "-")
            try:
               List.objects.get(user=request.user, name=name)
               response_text["error_messages"] = "List already exists";
            except List.DoesNotExist:
                if name not in blacklisted_listnames:
                    new_list = List(user=request.user, name=name,
                                    pretty_name=pretty_name, type="custom")
                    new_list.save()
                    response_text["lists"] = {
                        "name":name,
                        "pretty_name":pretty_name,
                        "type":"custom"
                    };
                    response_text["error"] = False               
    return HttpResponse(json.dumps(response_text), content_type='application/json')

@transaction.atomic
@login_required
def delete_list(request):
    response_text = { "error" : True, "error_messages": "Invalid input" }
    if request.method == "POST":
        if request.POST['name']:
            name = request.POST['name']
            try:
                list_to_delete = List.objects.get(user=request.user, name=name)
                list_to_delete.delete();
                response_text["error_messages"] = "";
                response_text["error"] = False     
            except List.DoesNotExist:
                response_text["error_messages"] = "List does not exist";
    return HttpResponse(json.dumps(response_text), content_type='application/json')

# @transaction.atomic
# @login_required
# def update_settings(request):
#     response_text = {
#         "error" : True,
#         "error_messages" : ["Request was not a post"]
#     }
#     if request.method == "POST":
#         settings = request.user.settings
#         settings_form = SettingsForm(request.POST, user=request.user, 
#                                                     instance=settings)
#         if settings_form.is_valid():
#             response_text["error_messages"] = []
#             response_text["error"] = False
#             settings_form.save()
#         else:
#             response_text["error_messages"] = ["An error has occured"]

#     return HttpResponse(json.dumps(response_text), content_type='application/json')

@transaction.atomic
@login_required
def manage_list(request):
    response_text = {
        "error" : True,
        "error_messages" : ["Error Occurred"]
    }
    if request.method == "POST":
        form = ManageListForm(request.POST)
        print form
        print request.POST
        print "MANAGED"
        if form.is_valid():
            print "FORM VALID"
            trakt_id = form.cleaned_data["trakt_id"]
            name = form.cleaned_data["name"]
            
            # get list if exists
            try:
                curr_list = List.objects.get(user=request.user,name=name)
            except:
                curr_list = None
                response_text["error_messages"] = ["List does not exist"]

            # get media item
            try:
                media = Movie.objects.get(trakt_id=trakt_id)
                media_type = "movies"
                # remove media from list if exists
                try:
                    in_list = curr_list.movies.all().get(trakt_id=trakt_id)
                except:
                    in_list = None
            except:
                try:
                    media = Show.objects.get(trakt_id=trakt_id)
                    media_type = "shows"
                    # remove media from list if exists, otherwise adds to list
                    try:
                        in_list = curr_list.shows.all().get(trakt_id=trakt_id)
                    except:
                        in_list = None
                except:
                    response_text["error_messages"] = ["Media item does not exist"]

            if in_list:
                if curr_list.name not in ["watched", "watching", "to-watch"]:
                    getattr(curr_list, media_type).remove(media)
            else:
                if name in ["watched", "to-watch", "watching"]:
                    defaults = { list_obj.name : list_obj for list_obj in List.objects.filter(user=request.user,
                                                                                              type="default") }
                    if (getattr(defaults["watched"], media_type).filter(trakt_id=trakt_id).exists()):
                        getattr(defaults["watched"], media_type).remove(media)
                        defaults["watched"].save()
                    elif (getattr(defaults["to-watch"], media_type).filter(trakt_id=trakt_id).exists()):
                        getattr(defaults["to-watch"], media_type).remove(media)
                        defaults["to-watch"].save()
                    elif (getattr(defaults["watching"], media_type).filter(trakt_id=trakt_id).exists()):
                        getattr(defaults["watching"], media_type).remove(media)
                        defaults["watching"].save()
                getattr(curr_list, media_type).add(media)

            curr_list.save()
            response_text["error"] = False
            response_text["error_messages"] = []

    return HttpResponse(json.dumps(response_text), content_type='application/json')

@transaction.atomic
@login_required
def remove_media(request):
    response_text = {
        "error" : True,
        "error_messages" : ["Request was not a post"]
    }

    if request.method == "POST":
        trakt_id = request.POST["trakt_id"]
        
        # get media item
        try:
            media = Movie.objects.get(trakt_id=trakt_id)
            media_type = "movies"
        except:
            try:
                media = Show.objects.get(trakt_id=trakt_id)
                media_type = "shows"
            except:
                response_text["error_messages"] = ["Media item does not exist"]

        print media_type

        if media:
            if media_type == "movies":
                lists = List.objects.filter(user=request.user,movies__trakt_id=trakt_id)
            else:
                lists = List.objects.filter(user=request.user,shows__trakt_id=trakt_id)

            print lists

            for l in lists:
                getattr(l, media_type).remove(media)
                l.save()
            
            response_text["error"] = False;
        else:
            response_text["error_messages"] = ["The media does not exist"]

    return HttpResponse(json.dumps(response_text), content_type='application/json')

def movie_info_page(request, trakt_id):
    if request.method != "GET":
        return HttpResponseRedirect(reverse("movies"))

    headers = {
        'Content-Type': 'application/json',
        'trakt-api-version' : '2',
        'trakt-api-key' : CLIENT_ID
    }

    url = 'https://api-v2launch.trakt.tv/movies/{0}/people?extended=images'.format(trakt_id)
    result = requests.get(url, headers=headers)

    try:
        movie_people = result.json()
    except:
        return home(request)
        
    orig_crew = movie_people.get('crew', {})
    full_crew = []
    full_crew += orig_crew.get('directing', [])
    full_crew += orig_crew.get('production', [])
    full_crew += orig_crew.get('writing', [])
    full_crew += orig_crew.get('camera', [])
    full_crew += orig_crew.get('art', [])
    full_crew += orig_crew.get('costume & make-up', [])
    full_crew += orig_crew.get('sound', [])
    full_crew += orig_crew.get('crew', [])

    movie_people['crew'] = full_crew

    # Get from the API and add the expected fields
    # movie_info = get_full_movie(trakt_id, SEARCH_CACHE, CACHE_TIMEOUT)
    movie_info = get_from_API(trakt_id, 'movie');
    movie_info["genre_set"] = {}
    movie_info["genre_set"]["all"] = movie_info["genres"]
    movie_info["fanart_url"] = movie_info["images"]["fanart"]["thumb"]
    movie_info["poster_url"] = movie_info["images"]["poster"]["medium"]

    #TEMP API
    # a_movie = cani_search('V for Vendetta')[0]
    # availability = [streaming(a_movie['_id']), rental(a_movie['_id']), purchase(a_movie['_id']), 
    #                                             dvd(a_movie['_id']), xfinity(a_movie['_id'])]

    watched = False
    add = True
    if request.user.is_authenticated():
        lists = List.objects.filter(user=request.user)
        if Movie.objects.filter(trakt_id=trakt_id,list__in=lists).exists():
            add = False
            movie = Movie.objects.get(trakt_id=trakt_id)
            watched_list = List.objects.get(user=request.user, name="watched")
            if watched_list in movie.list_set.all():
                watched = True

    context = {
        # "temp_available": availability,
        "add": add,
        "watched": watched,
        "media_info": movie_info,
        "media_people": movie_people
    }
    return render(request, 'movie_info.html', context)

def person_info_page(request, trakt_id):
    if request.method != "GET":
        return home(request)

    headers = {
        'Content-Type': 'application/json',
        'trakt-api-version' : '2',
        'trakt-api-key' : CLIENT_ID
    }

    url = 'https://api-v2launch.trakt.tv/people/{0}?extended=full,images'.format(trakt_id)
    result = requests.get(url, headers=headers)

    try:
        person_info = result.json()
    except:
        return home(request)

    if person_info['birthday'] != None:
        formatted = strptime(person_info['birthday'],"%Y-%m-%d")
        person_info['birthday'] = datetime.fromtimestamp(mktime(formatted))
    if person_info['death'] != None:
        formatted = strptime(person_info['death'],"%Y-%m-%d")
        person_info['death'] = datetime.fromtimestamp(mktime(formatted))

    url = 'https://api-v2launch.trakt.tv/people/{0}/movies?extended=images'.format(trakt_id)
    result = requests.get(url, headers=headers)

    try:
        person_movies = result.json()
    except:
        return home(request)
    
    movies_dict = person_movies.get('crew', {})
    full_movies = []
    full_movies += person_movies.get('cast', {})
    full_movies += movies_dict.get('directing', [])
    full_movies += movies_dict.get('production', [])
    full_movies += movies_dict.get('writing', [])
    full_movies += movies_dict.get('camera', [])
    full_movies += movies_dict.get('art', [])
    full_movies += movies_dict.get('costume & make-up', [])
    full_movies += movies_dict.get('sound', [])
    full_movies += movies_dict.get('crew', [])
    person_movies = full_movies

    url = 'https://api-v2launch.trakt.tv/people/{0}/shows?extended=images'.format(trakt_id)
    result = requests.get(url, headers=headers)

    try:
        person_shows = result.json()
    except:
        return home(request)

    show_dict = person_shows.get('crew', {})
    full_shows = []
    full_shows += person_shows.get('cast', [])
    full_shows += show_dict.get('directing', [])
    full_shows += show_dict.get('production', [])
    full_shows += show_dict.get('writing', [])
    full_shows += show_dict.get('camera', [])
    full_shows += show_dict.get('art', [])
    full_shows += show_dict.get('costume & make-up', [])
    full_shows += show_dict.get('sound', [])
    full_shows += show_dict.get('crew', [])
    person_shows = full_shows

    context = {
        "person_info": person_info,
        "person_movies": person_movies,
        "person_shows": person_shows
    }
    return render(request, 'person_info.html', context)

@login_required
def movies(request, listname):
    lists = List.objects.filter(user=request.user).exclude(name="watching").order_by('id')
    sort_order = Settings.objects.get(user=request.user).sort_movie_by
    if listname == "all":
        movies = Movie.objects.filter(list__in=lists).distinct().order_by(sort_order)
        curr_list = get_object_or_404(List.objects.filter(user=request.user, name=listname))
    else:
        curr_list = get_object_or_404(List.objects.filter(user=request.user, name=listname))
        movies = Movie.objects.filter(list=curr_list).distinct().order_by(sort_order)
    context = {
        'media': movies,
        'lists' : lists,
        'curr_list': curr_list
    }
    return render(request, 'movies.html', context)

@login_required
def shows(request, listname):
    lists = List.objects.filter(user=request.user).order_by('id')
    curr_list = get_object_or_404(List.objects.filter(user=request.user, name=listname))
    shows = shows_example
    context = {
        'media': shows,
        'lists' : lists,
        'curr_list': curr_list
    }
    return render(request, 'shows.html', context)

@login_required
@transaction.atomic
def search(request):
    context = {
        "movies" : [],
        "shows" : [],
        "people" : [],
        "lists" : List.objects.filter(user=request.user),
    }
    if request.method != "GET" or "query" not in request.GET:
        return render(request, "search.html", context)

    # get query
    query = request.GET["query"] 
    # limit types to movies, shows, people
    content_types = "movie,show,person"
    # API call url
    url = 'https://api-v2launch.trakt.tv/search?query={0}&type={1}&limit=50'.format(query, content_types)
    headers = {
        'Content-Type': 'application/json',
        'trakt-api-version' : '2',
        'trakt-api-key' : CLIENT_ID,
    }
    tag = "search-{0}".format(query.strip().lower())
    # send API call
    result = requests.get(url, headers=headers)
    # convert to readable JSON
    result = result.json()


    # split into categories
    context["movies"] = [item["movie"] for item in result if item["type"] == "movie"]
    context["shows"] = [item["show"] for item in result if item["type"] == "show"]
    context["people"] = [item["person"] for item in result if item["type"] == "person"]

    # remove type from results
    for movie in context["movies"]:
        movie["type"] = "movie"
    for show in context["shows"]:
        show["type"] = "show"
    for person in context["people"]:
        person["type"] = "person"

    # print context["movies"]
    
    #TODO SORT DATA FOR RELEVANCY, EFFICIENCY AND MORE
    return render(request, "search.html", context)

@login_required
@transaction.atomic
def add_media(request):
    response_text = {
        "error": True
    }
    if request.method == "POST":
        add_media_form = AddMediaForm(request.POST)
        if add_media_form.is_valid():
            trakt_id = add_media_form.cleaned_data["trakt_id"]
            content_type = add_media_form.cleaned_data["type"]

            watchlist = List.objects.get(user=request.user, name="to-watch")
            if content_type == "movie":
                movie = add_movie(trakt_id)
                watchlist.movies.add(movie)
            elif content_type == "show":
                show = add_show(trakt_id)
                user_show, _ = UserTVShow.objects.update_or_create(user=request.user,
                                                                   trakt_id=trakt_id,
                                                                   show=show)
                user_show.save()
                watchlist.shows.add(user_show)              
            
            watchlist.save()
            response_text["error"] = False

    return HttpResponse(json.dumps(response_text), content_type='application/json')

@transaction.atomic
def add_movie(trakt_id):
    movie_info = get_from_API(trakt_id, "movie")
    try:
        movie = Movie.objects.get(trakt_id=trakt_id)
        movie.title = movie_info["title"]
        movie.date = movie_info["released"]
        movie.poster_url = movie_info.get("images", {}).get("poster", {}).get("thumb", "")
        movie.fanart_url = movie_info.get("images", {}).get("fanart", {}).get("thumb", "")
    except:
        movie = Movie(trakt_id=trakt_id,
                      title=movie_info["title"],
                      date=movie_info["released"],
                      poster_url=movie_info.get("images", {}).get("poster", {}).get("thumb", ""),
                      fanart_url=movie_info.get("images", {}).get("fanart", {}).get("thumb", ""))
    movie.save()
    for genre in movie_info["genres"]:
        g, _ = MovieGenre.objects.update_or_create(movie=movie, genre=genre)
        g.save()

    return movie

def get_from_API(trakt_id, type):
    if type == "movie":
        headers = {
            'Content-Type': 'application/json',
            'trakt-api-version' : '2',
            'trakt-api-key' : CLIENT_ID
        }
        url = 'https://api-v2launch.trakt.tv/movies/{0}?extended=full,images'.format(trakt_id)
        movie_info = requests.get(url, headers=headers).json()

        if movie_info['released'] != None:
            formatted = strptime(movie_info['released'], "%Y-%m-%d")
            movie_info['released'] = datetime.fromtimestamp(mktime(formatted))

        return movie_info

    elif type == "show":
        #here
        pass
