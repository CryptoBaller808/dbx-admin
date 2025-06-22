import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

// Define the container style and other constants for the map
const containerStyle = {
  width: '100%',
  height: '200px',
};

const MapComponent = ({ locations }) => {
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });  // Default center
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
      });
      setMapCenter(bounds.getCenter().toJSON());  // Set map center based on the markers
      setZoom(12);  // Adjust zoom level based on bounds (you may want to fine-tune this)
    }
  }, [locations]);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelectedCity(location)} // Set the selected city on marker click
          />
        ))}

        {selectedCity && (
          <InfoWindow
            position={{ lat: selectedCity.lat, lng: selectedCity.lng }}
            onCloseClick={() => setSelectedCity(null)} // Close the info window
          >
            <div>
              <h3>{selectedCity.address}</h3>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
