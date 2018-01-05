from django.db import models
from django.contrib.auth.models import User

class Settings(models.Model):
	default_movie_view = models.CharField(max_length=10, default="poster")
	default_show_view = models.CharField(max_length=10, default="fanart")
	default_search_view = models.CharField(max_length=10, default="poster")
	default_movie_list = models.CharField(max_length=30, default="to-watch")
	default_show_list = models.CharField(max_length=30, default="watching")
	default_home_page = models.CharField(max_length=10, default="movies")
	sort_movie_by = models.CharField(max_length=30, default="-date")
	sort_show_by = models.CharField(max_length=30, default="latest_episode")
	default_movie_alert = models.CharField(max_length=30, default="day_before")
	default_show_alert = models.CharField(max_length=30, default="hour_before")
	alert_by_email = models.CharField(max_length=10, default="true")
	pro = models.CharField(max_length=10, default="false")
	user = models.OneToOneField(User, on_delete=models.CASCADE)

class Movie(models.Model):
	trakt_id = models.IntegerField(primary_key = True)
	title = models.CharField(max_length=50)
	date = models.DateField(null = True)
	poster_url = models.URLField(blank = True, null = True)
	fanart_url = models.URLField(blank = True, null = True)
	description = models.CharField(max_length=500, null = True)

	def __unicode__(self):
	    return str(self.title) + " (" + str(self.trakt_id) + ")"

class Show(models.Model):
	trakt_id = models.IntegerField(primary_key = True) 
 	title = models.CharField(max_length=50)
 	date_added = models.DateField(null = False)
 	poster_url = models.URLField(blank = True, null = True)
 	fanart_url = models.URLField(blank = True, null = True)
 	description = models.CharField(max_length=500, null = True)

class List(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	name = models.CharField(max_length=30)
	pretty_name = models.CharField(max_length=30)
	type = models.CharField(max_length=30, default="custom")
	movies = models.ManyToManyField(Movie)
	shows = models.ManyToManyField(Show)

class MovieGenre(models.Model):
	movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
	genre = models.TextField(max_length=30)

class ShowGenre(models.Model):
	show  = models.ForeignKey(Show, on_delete=models.CASCADE)
	genre = models.TextField(max_length=30)