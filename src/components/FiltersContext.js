import React, { createContext, useState } from "react";

// Создаём контекст
export const FiltersContext = createContext();

// Провайдер контекста для управления состоянием фильтров
export const FiltersProvider = ({ children }) => {
    const [filters, setFilters] = useState({
        cafe: true,
        restaurant: true,
        mall: true,
    });

    // Функция для переключения состояния фильтра
    const toggleFilter = (filter) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filter]: !prevFilters[filter],
        }));
    };

    return (
        <FiltersContext.Provider value={{ filters, toggleFilter }}>
            {children}
        </FiltersContext.Provider>
    );
};
