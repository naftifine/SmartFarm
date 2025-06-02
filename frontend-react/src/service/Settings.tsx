import { useState, useEffect } from "react";
import { OnOffButton } from "../components/onoffButton";
import { ClickButton } from "../components/clickButton";
export const Settings = () => {
    // set time
    const [inputValue, setInputValue] = useState("");
    const [isToggled, setIsToggled] = useState(false);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isToggled) {
            const timeValue = e.target.value.replace(/[^0-9:]/g, "").slice(0, 5);
            const formattedValue = timeValue.replace(/(\d{2})(\d{2})/, "$1:$2");
            setInputValue(formattedValue);
        }
    };
    // toggle button
    const handleToggle = (buttonId: string, isToggledState: boolean, setToggleState: React.Dispatch<React.SetStateAction<boolean>>) => {
        const button = document.getElementById(buttonId);
        if (isToggledState) {
            button?.classList.remove("bg-[#0E947A]");
            button?.classList.remove("text-white");
            button?.classList.add("bg-white");
            button?.classList.add("text-gray-900");
        } else {
            button?.classList.add("bg-[#0E947A]");
            button?.classList.remove("bg-white");
            button?.classList.add("text-white");
            button?.classList.remove("text-gray-900");
        }
        setToggleState(!isToggledState);
    };

    useEffect(() => {
        const toggleButton = document.getElementById("toggleClick");
        const handleToggleClick = () => handleToggle("toggleClick", isToggled, setIsToggled);

        toggleButton?.addEventListener("click", handleToggleClick);

        return () => {
            toggleButton?.removeEventListener("click", handleToggleClick);
        };
    }, [isToggled]);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="flex-1 bg-white rounded-xl shadow-lg p-6 h-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-1">
                    <h1 className="text-center text-2xl md:text-4xl text-blue-900 pt-3 pb-6">
                        <strong>Automatic Light Bulb On</strong>
                    </h1>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <button
                            id="toggleClick"
                            className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 "
                        >
                        Hourly
                        </button>
                        <input 
                            type="text"
                            id="timeInput"
                            value={inputValue}
                            onChange={handleInputChange}
                            className="py-2.5 px-5 text-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                            placeholder="00:00"
                         />
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <ClickButton/>
                            <select id="dayInWeek" title="Select day in week" className="py-2.5 px-5 text-center text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 " defaultValue="Choose day">
                                <option value="" disabled>Choose day</option>
                                <option value="Mon">Monday</option>
                                <option value="Tue">Tuesday</option>
                                <option value="Wed">Wednesday</option>
                                <option value="Thu">Thursday</option>
                                <option value="Fri">Friday</option>
                                <option value="Sat">Saturday</option>
                                <option value="Sun">Sunday</option>
                            </select>
                    </div>
                    <div className="flex items-center justify-center mt-8">
                        <OnOffButton/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 h-75 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-2">
                    <h1 className="text-center text-2xl md:text-4xl text-blue-900 pt-3 pb-6">
                        <strong>Light Intensity</strong>
                    </h1>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6 ml-50">
                        <strong>20</strong>
                        <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-indigo-100 ml-2">
                        <svg className="h-8 w-8 text-blue-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <line x1="19" y1="5" x2="5" y2="19" />  <circle cx="6.5" cy="6.5" r="2.5" />  <circle cx="17.5" cy="17.5" r="2.5" /></svg>
                        </span>
                    </h1>
                    <a className="inline-block mt-8 ml-50 px-8 py-2 rounded-full text-xl font-bold text-white bg-green-300 hover:bg-green-400 transition-transform duration-300 hover:scale-105">
                        Stable
                    </a>
                </div>
        </div>
    )
}