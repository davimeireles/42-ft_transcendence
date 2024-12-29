import requests
import datetime
from . import models
from django.contrib import messages
from django.shortcuts import render, redirect
from app.forms import CustomUserForm

def register_user(request):
    if request.method == 'POST':
        form = CustomUserForm(request.POST)
        if form.is_valid():
            user_object = form.save(commit=False)
            user_object.nickname = form.cleaned_data['nickname']
            user_object.email = form.cleaned_data['email']
            user_object.set_password(form.cleaned_data['password1'])  # Use set_password to hash the password
            user_object.save()
            return redirect('index.html')  # Redirect to the appropriate page
    else:
        form = CustomUserForm()
    context = {'form': form}
    return render(request, 'index.html', context)