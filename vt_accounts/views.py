from django.template  import RequestContext
from django.shortcuts import render

def index(request):
    context = RequestContext(request)

    return render(request, 'index.html')
