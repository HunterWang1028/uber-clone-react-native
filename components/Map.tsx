import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const Map = () => {
  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const {
    userLongitude,
    userLatitude,
    destinationLongitude,
    destinationLatitude,
  } = useLocationStore();

  const { selectedDriver, setDrivers } = useDriverStore();

  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (Array.isArray(drivers)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude, setDrivers]);

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLongitude,
        userLatitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [
    markers,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    setDrivers,
  ]);

  if (loading || !userLatitude || !userLongitude)
    return (
      <View className=" justify-between items-center w-full">
        <ActivityIndicator size={"small"} color="#000" />
      </View>
    );

  if (error) {
    return (
      <View className=" justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }
  return (
    <MapView
      style={{ width: "100%", height: "100%" }}
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}
      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />
          <MapViewDirections
            origin={{
              latitude: userLatitude,
              longitude: userLongitude,
            }}
            destination={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            apikey={directionsAPI!}
            strokeColor="#0286ff"
            strokeWidth={5}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
