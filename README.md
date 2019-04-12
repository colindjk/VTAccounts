# VTAccounts
_Payment manager for Virginia Tech CS Department_

API: Running on a Python Django backend with a React JavaScript frontend, the VTAccounts API keeps track of accounts, funds (AKA fiscal accounts), employees, payments, salaries, as well as fringe and indirect rates. 

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

### Data Processing
_From excel files to frontend UI components_


---
## API Schema:
Any field relating to an `id` is known to be a positive integer or undefined (i.e. `fund`, `transactable`, `account`, `employee`).
All `date` & `editable_date` fields will be in `YYYY-MM-DD` format.
`updated_on` represents the last time a record was updated by the server.
Once data is processed and added to the frontend store, each record is labelled with a `timestamp` field which is used for caching purposes. 
### `api/accounts`
Account fields vary based on `account_level`.
```JS
{
    "id": Number,
    "name": String,
    "code": String,
    "parent": Number,
    "children": Array<Number>, // id's for children
    "has_indirect": Boolean,
    "is_indirect": Boolean,
    "has_fringe": Boolean, // account_level === "account" || "transactable"
    "is_fringe": Boolean, // account_level === "account" || "transactable"
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
### `api/funds`
```js
{
    "id": Number,
    "name": String,
    "budget": Number,
    "verified": Boolean,
    "editable_date": String
}
```

### `api/employees`
```js
{
    "id": Number,
    "first_name": String,
    "last_name": String,
    "pid": String,
    "position_number": String,
    "transactable": Number,
    "updated_on": Number
}
```

### `api/payments`
```js
{
    "id": Number,
    "fund": Number,
    "date": String,
    "transactable": Number,
    "paid": Number,
    "budget": Number,
    "updated_on": Number,
    "is_manual": Boolean
}
```

### `api/salaries`
```js
{
    "id": Number,
    "total_ppay": Number,
    "employee": Number,
    "date": String,
    "updated_on: Number
}
```

### `api/indirects`
```js
{
    "id": Number,
    "date": String,
    "rate": Number,
    "fund": Number,
    "updated_on": Number
}
```

### `api/fringes`
```js
{
    "id": Number,
    "date": String,
    "rate": Number,
    "account": Number,
    "updated_on": Number
}
```
