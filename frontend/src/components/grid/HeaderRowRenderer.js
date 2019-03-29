import React from 'react'
import { createSelector } from 'reselect'

// Wraps the given proxy in another which checks to see if the given field can be
// found in `fields`.
const selectHeaderRow = createSelector(
  (id) => id,
  (id, data) => data,
  (id, data, fields) => fields,
  (id, data, fields) => {
    fields = fields || {}
    return new Proxy(data, {
      get: (data, field) => {
        if (field === "isHeader") { return true }
        if (field === "id") { return id }
        if (field in fields) { return fields[field] }
        return data[field]
      }
    })
  }
)

export default ({
  renderBaseRow, 
  row: { id, data, fields, dependentValues }, 
  ...props
}) => (  
  <div>
    <div className="react-grid-HeaderRow">
      {
        renderBaseRow({ 
          ...props, 
          row: selectHeaderRow(id, data, fields), 
          dependentValues,
        })
      }
    </div>
  </div>
)

