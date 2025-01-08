import React, { useContext } from "react";
import { FiltersContext } from "./FiltersContext";
import styles from "./Map.module.css";

function FiltersPanel() {
    const { filters, toggleFilter } = useContext(FiltersContext);

    return (
        <div className={styles.filters}>
            <label>
                <input
                    type="checkbox"
                    checked={filters.cafe}
                    onChange={() => toggleFilter("cafe")}
                />
                Кафе
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={filters.restaurant}
                    onChange={() => toggleFilter("restaurant")}
                />
                Рестораны
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={filters.mall}
                    onChange={() => toggleFilter("mall")}
                />
                Торговые центры
            </label>
        </div>
    );
}

export default FiltersPanel;
