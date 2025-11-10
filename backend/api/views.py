from django.http import JsonResponse

def echo_view(request, text):
    times = request.GET.get('times')
    if times is not None:
        try:
            n = max(1, int(times))
        except ValueError:
            n = 1
        return JsonResponse({"echo": [text] * n})
    return JsonResponse({"echo": text})
