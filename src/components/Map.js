// Импортируем нужные библиотеки
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./Map.module.css";
import L from "leaflet";

// Иконки для разных типов мест
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
    const [filters, setFilters] = useState({
        cafe: true,
        restaurant: true,
        mall: true,
    });

    // Добавлено состояние для хранения данных о локациях
    const [locations, setLocations] = useState([]);

    // Добавлен эффект для загрузки данных из Overpass API
    useEffect(() => {
        // Функция для запроса данных из Overpass API
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
                const response = await fetch(url); // Запрос к Overpass API
                const data = await response.json(); // Получение JSON-ответа

                // Преобразование данных для работы с маркерами
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

                setLocations(formattedLocations); // Установка преобразованных данных в состояние
            } catch (error) {
                console.error("Ошибка загрузки данных: ", error); // Логирование ошибок
            }
        };

        fetchLocations(); // Вызов функции загрузки данных
    }, []);

    const handleFilterChange = (type) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [type]: !prevFilters[type],
        }));
    };

    return (
        <div className={styles.mapWrapper}>
              <div className={styles.mapBlur}></div>
            <div className={styles.filters}>
                <label>
                    <input
                        type="checkbox"
                        checked={filters.cafe}
                        onChange={() => handleFilterChange("cafe")}
                    />
                    Кафе
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={filters.restaurant}
                        onChange={() => handleFilterChange("restaurant")}
                    />
                    Рестораны
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={filters.mall}
                        onChange={() => handleFilterChange("mall")}
                    />
                    Торговые центры
                </label>
            </div>
            <MapContainer center={[68.9725, 33.0760]} zoom={15} className={styles.mapContainer}>
                <TileLayer
                    // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=\'https://www.openstreetmap.org/copyright\'>OpenStreetMap</a> contributors"
                />
                {/* Отображение маркеров на основе данных и фильтров */}
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
