from django import forms

from django.contrib.auth.models import User
from .models import *

class RegisterForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["email", "first_name", "password"]
        widgets = {
            "email" : forms.TextInput(attrs={"placeholder": "email"}),
            "first_name" : forms.TextInput(attrs={"placeholder": "nickname"}),
            "password" : forms.PasswordInput(attrs={"placeholder": "password"})
        }

    def clean_first_name(self):
        first_name = self.cleaned_data.get("first_name")
        # clean empty first name
        # since first name is optional
        if first_name.strip() == "":
            first_name = ""
        return first_name

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if User.objects.filter(username=email).exists():
            raise forms.ValidationError("User already exists with that email")
        return email

class SettingsForm(forms.ModelForm):
    class Meta:
        model = Settings
        exclude = ["user","pro"]

    # def __init__(self, *args, **kwargs):
    #     self.user = kwargs.pop("user", None)
    #     super(SettingsForm, self).__init__(*args, **kwargs)

class AddMediaForm(forms.Form):
    trakt_id  = forms.IntegerField(required=True,
                                   error_messages={"required": "trakt_id is required"})
    type      = forms.CharField(required=True,
                                error_messages={"required": "List name is required"})

class ManageListForm(forms.Form):
    trakt_id  = forms.IntegerField(required=True,
                                   error_messages={"required": "trakt_id is required"})
    name      = forms.CharField(required=True,
                                error_messages={"required": "List name is required"})