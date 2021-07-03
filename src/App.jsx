import React, { useEffect, useState } from 'react';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';
import axios from 'axios';

const DEFAULT_COORDS = { latitude: 37.4419, longitude: -122.1430 };
const HOME_ICON = 'http://maps.google.com/mapfiles/ms/icons/blue-pushpin.png';
const SUPER_CHARGER_ICON = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
const STANDARD_CHARGER_ICON = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const TESLA_URL = process.env.REACT_APP_TESLA_URL;

const App = (props) => {
  const [coordinates, setCoordinates] = useState(null);
  const [locations, setLocations] = useState([]);
  const mapStyles = { 
    width: '100%',
    height: '100%'
  }


  useEffect(() => {
    const getTeslaStations = async () => {
      const teslaLocations = await axios.get(TESLA_URL);
      setLocations([...teslaLocations.data]);
    }
    const handleGetCoordinates = (location) => {
      setCoordinates({latitude: location.coords.latitude, longitude: location.coords.longitude});  
    };  
    const handleDenyLocationPermission = (_) => {
      setCoordinates(DEFAULT_COORDS);
    }

    getTeslaStations();
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation"}).then((result) => {
        if (result.state === "granted") {
          navigator.geolocation.getCurrentPosition(handleGetCoordinates);
        } else if (result.state === "prompt") {
          navigator.geolocation.getCurrentPosition(handleGetCoordinates, handleDenyLocationPermission);
        } else {
          handleDenyLocationPermission();
        }
      })
    } else {
      handleDenyLocationPermission();
    }
  }, []);

  const renderMarkers = () => {
    return locations.map((location) => {
      return <Marker 
        key={`${location.latitude}-${location.longitude}-${location.title}`} 
        title={location.title} 
        position={{lat: location.latitude, lng: location.longitude}} 
        icon={{
          url: location.location_type.includes("supercharger") ? SUPER_CHARGER_ICON : STANDARD_CHARGER_ICON,
          anchor: new props.google.maps.Point(32,32),
          scaledSize: new props.google.maps.Size(32,32) 
        }}
        />
    });
  }

  const renderMap = () => {
    return(
      <Map google={props.google}
      style={mapStyles}
      initialCenter={{
        lat: coordinates.latitude,
        lng: coordinates.longitude
      }}>
        <Marker 
          title={'Your Location'}
          position={{lat: coordinates.latitude, lng: coordinates.longitude}}
          icon={{
            url: HOME_ICON,
            anchor: new props.google.maps.Point(32,32),
            scaledSize: new props.google.maps.Size(32,32) 
          }}>
        </Marker>
        {renderMarkers()}
      </Map>
    );
  }

  const showLoader = () => {
    return(<p data-testid="map">Loading....</p>)
  }

  return (
    <div data-testid="map">
      {coordinates !== null ? renderMap() : showLoader()}
    </div>
  );
}

export default GoogleApiWrapper({apiKey: API_KEY})(App);
