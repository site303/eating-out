// import React, { useContext, useEffect, useRef, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import FiltersPanel from "./Filter";
// import styles from "./Map.module.css";
// import L from "leaflet";
// import { FiltersContext } from "./FiltersContext";

// const icons = {
//     cafe: new L.Icon({
//         iconUrl: require("../assets/icons/cafe.png"),
//         iconSize: [25, 25],
//     }),
//     restaurant: new L.Icon({
//         iconUrl: require("../assets/icons/restaurants.png"),
//         iconSize: [25, 25],
//     }),
//     mall: new L.Icon({
//         iconUrl: require("../assets/icons/mall.png"),
//         iconSize: [40, 40],
//     }),
// };

// function Map() {
//     const { filters } = useContext(FiltersContext); // Используем фильтры из контекста
//     const mapRef = useRef(null);
//     const [locations, setLocations] = useState([]);

//     useEffect(() => {
//         const fetchLocations = async () => {
//             const query = `
//                 [out:json];
//                 (
//                     node["amenity"="cafe"](68.91,33.02,69.02,33.11);
//                     node["amenity"="restaurant"](68.91,33.02,69.02,33.11);
//                     node["shop"="mall"](68.91,33.02,69.02,33.11);
//                 );
//                 out body;
//             `;
//             const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

//             try {
//                 const response = await fetch(url);
//                 const data = await response.json();

//                 const formattedLocations = data.elements.map((element) => {
//                     let type;
//                     if (element.tags.amenity === "cafe") type = "cafe";
//                     else if (element.tags.amenity === "restaurant") type = "restaurant";
//                     else if (element.tags.shop === "mall") type = "mall";

//                     return {
//                         id: element.id,
//                         type,
//                         name: element.tags.name || "Без названия",
//                         position: [element.lat, element.lon],
//                     };
//                 });

//                 setLocations(formattedLocations);
//             } catch (error) {
//                 console.error("Ошибка загрузки данных: ", error);
//             }
//         };

//         fetchLocations();
//     }, []);

//     return (
//         <div className={styles.mapWrapper}>
//             <div className={styles.mapBlur}></div>
//             <MapContainer
//                 center={[68.9725, 33.0760]}
//                 zoom={15}
//                 className={styles.mapContainer}
//                 ref={mapRef}
//             >
//                 <TileLayer
//                     url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
//                 />
//                 <FiltersPanel />
//                 {locations
//                     .filter((location) => filters[location.type])
//                     .map((location) => (
//                         <Marker
//                             key={location.id}
//                             position={location.position}
//                             icon={icons[location.type]}
//                         >
//                             <Popup>{location.name}</Popup>
//                         </Marker>
//                     ))}
//             </MapContainer>
//         </div>
//     );
// }

// export default Map;

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import FiltersPanel from "./Filter";
import styles from "./Map.module.css";

mapboxgl.accessToken = "your-mapbox-access-token-here"; // Укажите свой токен Mapbox

const Map = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        if (map.current) return; // Инициализация карты только один раз

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v11", // Стиль карты
            center: [33.0760, 68.9725],
            zoom: 15,
        });

        // Загрузка данных
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
                        coordinates: [element.lon, element.lat],
                    };
                });

                setLocations(formattedLocations);
            } catch (error) {
                console.error("Ошибка загрузки данных: ", error);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        if (!map.current || locations.length === 0) return;

        // Добавление слоев
        locations.forEach((location) => {
            map.current.addLayer({
                id: `${location.type}-${location.id}`,
                type: "symbol",
                source: {
                    type: "geojson",
                    data: {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: location.coordinates,
                                },
                                properties: {
                                    title: location.name,
                                    icon: location.type,
                                },
                            },
                        ],
                    },
                },
                layout: {
                    "icon-image": location.type,
                    "icon-size": 1.5,
                    "text-field": ["get", "title"],
                    "text-offset": [0, 1.5],
                    "text-anchor": "top",
                },
            });

            // Добавление пользовательских иконок
            map.current.loadImage(
                require(`../assets/icons/${location.type}.png`),
                (error, image) => {
                    if (error) throw error;
                    if (!map.current.hasImage(location.type)) {
                        map.current.addImage(location.type, image);
                    }
                }
            );
        });

        return () => {
            // Очистка слоев при размонтировании
            locations.forEach((location) => {
                if (map.current.getLayer(`${location.type}-${location.id}`)) {
                    map.current.removeLayer(`${location.type}-${location.id}`);
                }
                if (map.current.getSource(`${location.type}-${location.id}`)) {
                    map.current.removeSource(`${location.type}-${location.id}`);
                }
            });
        };
    }, [locations]);

    return (
        <div className={styles.mapWrapper}>
            <div className={styles.mapBlur}></div>
            <FiltersPanel />
            <div ref={mapContainer} className={styles.mapContainer}></div>
        </div>
    );
};

export default Map;

