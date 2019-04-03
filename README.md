VTAccounts: Bookkeeping @ Virginia Tech

API: Running on a Python Django backend with a React JavaScript frontend, the
VTAccounts API keeps track of accounts, employees, payments, salaries, as well as fringe and indirect rates. 

The given data can be separated into to types,

Flat records, and "date range" records. 
Flat records: Accounts, Employees, Funds
Flat records are used as the Y Axis in our tables when viewing payment data. 

Date range records: Payments, salaries, indirect & fringe rates. 
These records are listed out _by date_ over the X axis of the data grid. Payments to employees are listed as LOE if a salary is also available. Indirect and Fringe rates are accounted for _manually created_ transactions.

Frontend: Sagas
Using React and redux-sagas, the frontend cache's database tables via "sagas" middleware, which allows for asynchronous HTTP requests to be made to an API from a React application.

Frontend: Selectors
.  Edits can be made to update payments or salaries for accounts and employees.  You can also edit indirect and fringe rates, the changes are then expressed as verifiable virtual payments to associated funds / accounts.  These virtual payments are only calculated 

Frontend: Cache Coherence
In order to ensure cache coherence, the reducer logic propogates updates made to daterange data.  
For the payment cache, cache granularity 

Frontend: Data Formatting
Once the user selects a date range to view, payment information is prefetched and calculated in a cascading hierarchical format. 



Account schema, "transactable" types have an optional "employee" field.
```JSON
{
    "id": int,
    "name": String,
    "code": String,
    "parent": int,
    "children": array<int>, // id's for children
    "employee": Option<int>,
    "account_level": [
      "account_type" |
      "account_group" |
      "account_subgroup" |
      "account_class" |
      "account_object" |
      "account" |
      "transactable"
    ]
}
```

Fund
```
{
 "id": int,
 "name": String,
 "budget": int,
 "verified": boolean,
 "editable_date": String
}
```

Employee
```
{
    "id": int,
    "first_name": String,
    "last_name": String,
    "pid": String,
    "position_number": String,
    "transactable": int,
    "updated_on": int
}
```

Dated Records, the `date` field is in `YYYY-MM-DD` format.

Payment
```
{
    "id": int,
    "fund": int,
    "date": String,
    "transactable": int,
    "paid": int,
    "budget": int,
    "updated_on": int,
    "is_manual": boolean
}
```

Salary
```
{
    "id": int,
    "total_ppay": int,
    "employee": int,
    "date": String,
    "updated_on: int
}
```

Indirect Rate
```
{
    "id": int,
    "date": String,
    "rate": float,
    "fund": int,
    "updated_on": int
}
```

Fringe Rate
```
{
    "id": int,
    "date": String,
    "rate": float,
    "account": int,
    "updated_on": int
}
```
