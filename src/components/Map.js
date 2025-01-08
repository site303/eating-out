import React, { useContext, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import FiltersPanel from "./Filter";
import styles from "./Map.module.css";
import L from "leaflet";
import { FiltersContext } from "./FiltersContext";

const icons = {
    cafe: new L.Icon({
        iconUrl: require("../assets/icons/cafe.png"),
        iconSize: [25, 25],
    }),
    restaurant: new L.Icon({
        iconUrl: require("../assets/icons/restaurants.png"),
        iconSize: [25, 25],
    }),
    mall: new L.Icon({
        iconUrl: require("../assets/icons/mall.png"),
        iconSize: [40, 40],
    }),
};

function Map() {
    const { filters } = useContext(FiltersContext); // Используем фильтры из контекста
    const mapRef = useRef(null);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            const query = `
                [out:json];
                (
                    node["amenity"="cafe"](68.91,33.02,69.02,33.11);
                    node["amenity"="restaurant"](68.91,33.02,69.02,33.11);
                    node["shop"="mall"](68.91,33.02,69.02,33.11);
                );
                out body;
            `;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                const formattedLocations = data.elements.map((element) => {
                    let type;
                    if (element.tags.amenity === "cafe") type = "cafe";
                    else if (element.tags.amenity === "restaurant") type = "restaurant";
                    else if (element.tags.shop === "mall") type = "mall";

                    return {
                        id: element.id,
                        type,
                        name: element.tags.name || "Без названия",
                        position: [element.lat, element.lon],
                    };
                });

                setLocations(formattedLocations);
            } catch (error) {
                console.error("Ошибка загрузки данных: ", error);
            }
        };

        fetchLocations();
    }, []);

    return (
        <div className={styles.mapWrapper}>
            <div className={styles.mapBlur}></div>
            <MapContainer
                center={[68.9725, 33.0760]}
                zoom={15}
                className={styles.mapContainer}
                ref={mapRef}
            >
                <TileLayer
                    url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <FiltersPanel />
                {locations
                    .filter((location) => filters[location.type])
                    .map((location) => (
                        <Marker
                            key={location.id}
                            position={location.position}
                            icon={icons[location.type]}
                        >
                            <Popup>{location.name}</Popup>
                        </Marker>
                    ))}
            </MapContainer>
        </div>
    );
}

export default Map;
