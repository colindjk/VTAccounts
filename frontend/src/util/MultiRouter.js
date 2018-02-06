import React from 'react';
import { Route } from 'react-router-dom';

// MultiRouter.
export default function MultiRouter(routes, root = "") {
  var route_components = [];
  routes.forEach(route => {
    console.log(root + route.path);
    const path = root + route.path;

    route_components.push(
      <Route key={path}
             exact={route.exact || true}
             path={path}
             component={route.component} />
    )

    if (route.children) {
      route_components.concat(MultiRouter(route.children, root + route.path));
    }
  })

  return route_components;
}
