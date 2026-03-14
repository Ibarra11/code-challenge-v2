import React from "react";
import { createRoot } from "react-dom/client";

import RestaurantPermitMap from "./RestaurantPermitMap";

const container = document.getElementById("map");
const root = createRoot(container);
root.render(
  // Would use ReactErrorBoundary library to catch errors anywhere in RestaurantPermitMap and display a fallback UI.
  // <ReactErrorBoundary>
  <RestaurantPermitMap />,
  // </ReactErrorBoundary>
);
