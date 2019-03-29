import React from 'react';
import { Route } from 'react-router-dom';

// MultiRouter.
// If a route has children, exact=false by default. 
export default function MultiRouter(routes=[], root = "") {
  var route_components = [];
  routes.forEach(route => {
    const path = root + route.path
    const Component = route.component
    const RouteComponent = () => (<Component
      name={route.name}
      children={MultiRouter(route.children, root + route.path)}/>)
    const exact = route.exact || (!route.children && (route.exact === undefined))
    route_components.push(
      <Route
        key={path}
        exact={exact}
        path={path}
        component={RouteComponent}
      />
    )
  })

  return route_components
}
