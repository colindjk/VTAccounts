from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from api import serializers, models
# Create your views here.

# Returns account associated with the given pk.
# Optionally takes depth argument, which will populate depth levels of children
# in the account hierarchy tree.
class AccountView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, parent_pk, format=None):
        accounts = serializers.AccountSerializer(
                    models.AccountBase.objects.filter(parent=parent_pk),
                    many=True
                ).data
        return Response(accounts)

class TransactableView(APIView):
    renderer_classes = (JSONRenderer,)

    def get(self, request, format=None):
        table_data = {}
        context = { "fund": 1,
                    "start_date": "2016-12-01",
                    "end_date": "2017-09-01" }
        table_data['rows'] = serializers.AccountSerializer(
                models.AccountType.objects.all(), many=True).data
        table_data['extra'] = serializers.TransactableSerializer(
                                 models.Transactable.objects.all(),
                                 context=context, many=True).data
        return Response(table_data)

    def patch(self, request, format=None):
        print("Start")
        print(request.data)
        print(request.query_params)
        print("DONE")
        return Response()

    def update(self, request, format=None):
        pass

class EmployeeSalaryView(APIView):
    renderer_classes = (JSONRenderer,)

# TODO: Print out fields and field types
# TODO: Fields will then pass through a processer on the client-side
# TODO: Multi Column from array / dictionary.

# TODO: Fix this after demo
from django.http import HttpResponse, JsonResponse

from copy import deepcopy

def range():
    range = ["2017-07-01", "2017-12-01"]
    return models.PayPeriod.objects.filter(start_date__range=range)
    
def employee(request):

    serializer = serializers.TempEmployeeSerializer(
            models.EmployeeTransactable.objects.filter(
                    transactable__isnull=False
                ), many=True
        )
    data = serializer.data

    fields = deepcopy(serializer.child.fields)
    print(fields)
    columns = []
    for key in fields:
        col = {}
        col['key'] = key
        col['name'] = key
        columns.append(col)
    for row in data:
        print(row['salaries'])
        for dmy in row['salaries']:
            row[dmy] = row['salaries'][dmy]['salary']
        row.pop('salaries')


    for period in range():
        print(str(period.start_date))
        columns.append({
            'key': str(period.start_date),
            'name': str(period.start_date),
        })
    print(str(columns))

    return JsonResponse({
        "data": data,
        "columns": columns
    }, safe=False)

