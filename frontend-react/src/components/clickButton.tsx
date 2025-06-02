import { useState } from "react";

export const ClickButton = () => {
    const [isToggled, setIsToggled] = useState(false);

    const handleToggleClick = () => {
        setIsToggled(!isToggled);
    };

    return (
        <button
            onClick={handleToggleClick}
            className={`py-2.5 px-5 text-sm font-medium focus:outline-none rounded-lg border ${
                isToggled
                    ? "bg-[#0E947A] text-white border-gray-200"
                    : "bg-white text-gray-900 border-gray-200"
            }`}
        >
            Day in week
        </button>
    );
};