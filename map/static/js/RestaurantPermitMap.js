import React, { useEffect, useState } from "react";

import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import RAW_COMMUNITY_AREAS from "../../../data/raw/community-areas.geojson";

const START_YEAR = 2026;

// Generates years from 2026 to 2016
const YEAR_OPTIONS = [...Array(11).keys()].map((increment) => {
  return START_YEAR - increment;
});

function YearSelect({ setFilterVal }) {
  return (
    <>
      <label htmlFor="yearSelect" className="fs-3">
        Filter by year:{" "}
      </label>
      <select
        id="yearSelect"
        className="form-select form-select-lg mb-3"
        onChange={(e) => setFilterVal(e.target.value)}
      >
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </>
  );
}

export default function RestaurantPermitMap() {
  const communityAreaColors = ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"];
  const [error, setError] = useState(false);
  const [currentYearData, setCurrentYearData] = useState([]);
  const [year, setYear] = useState(2026);

  const yearlyDataEndpoint = `/map-data/?year=${year}`;

  useEffect(() => {
    setError(false);
    fetch(yearlyDataEndpoint)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch data for year: " + year);
        }
        // Right here,we should also check that the data structure  is valid using something like Zod or do it on the backend. Otherwise, it will break the app.
        return res.json();
      })
      .then(setCurrentYearData)
      .catch((err) => {
        // report error to something like Sentry
        setError(true);
      });
  }, [yearlyDataEndpoint]);

  const permitsIssuedThisYear = currentYearData.reduce((acc, curr) => {
    const area = Object.keys(curr)[0];
    return acc + curr[area].num_permits;
  }, 0);

  const maxNumPermitsInSingleArea = currentYearData.reduce((acc, curr) => {
    const area = Object.keys(curr)[0];
    return Math.max(acc, curr[area].num_permits);
  }, 0);

  function getColor(percentageOfPermits) {
    if (percentageOfPermits < 25) {
      return communityAreaColors[0];
    } else if (percentageOfPermits < 50) {
      return communityAreaColors[1];
    } else if (percentageOfPermits < 75) {
      return communityAreaColors[2];
    } else {
      return communityAreaColors[3];
    }
  }

  function setAreaInteraction(feature, layer) {
    const permitData = currentYearData.find(
      (data) => data[feature.properties.community],
    );

    const numPermits = permitData[feature.properties.community].num_permits;
    const percentageOfPermits = (numPermits / permitsIssuedThisYear) * 100;
    const color = getColor(percentageOfPermits);

    layer.setStyle({ fillColor: color });

    layer.on("mouseover", () => {
      layer.bindPopup(
        `${numPermits} permits issued in ${feature.properties.community}<br>${percentageOfPermits.toFixed(2)}% of total permits`,
      );
      layer.openPopup();
    });
  }

  return (
    <>
      {error ? (
        <p className="fs-4 text-danger bg-danger-subtle p-3 rounded-3">
          There was an error loading the data: Try selecting a different year.
        </p>
      ) : null}
      <YearSelect filterVal={year} setFilterVal={setYear} />
      <p className="fs-4">
        Restaurant permits issued this year: {permitsIssuedThisYear}
      </p>
      <p className="fs-4">
        Maximum number of restaurant permits in a single area:
        {maxNumPermitsInSingleArea}
      </p>
      <MapContainer id="restaurant-map" center={[41.88, -87.62]} zoom={10}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png"
        />
        {currentYearData.length > 0 ? (
          <GeoJSON
            data={RAW_COMMUNITY_AREAS}
            onEachFeature={setAreaInteraction}
            key={year}
          />
        ) : null}
      </MapContainer>
    </>
  );
}
