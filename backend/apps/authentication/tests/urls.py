from django.urls import include, path

urlpatterns = [
    path('api/auth/', include('apps.authentication.urls')),
]
