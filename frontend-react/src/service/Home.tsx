import { useState, useEffect } from "react";
import { getDeviceByNameApi } from "../apiService";

export const Home = () => {
    const [time, setTime] = useState(new Date());
    const [lightIntensity, setLightIntensity] = useState<number | null>(null);
    const [lightLoading, setLightLoading] = useState<boolean>(true);
    const [lightError, setLightError] = useState<string | null>(null);
    const [lightThresholds, setLightThresholds] = useState<{lower: number, upper: number}>({lower: 0, upper: 100});
    
    // Temperature state
    const [temperature, setTemperature] = useState<number | null>(null);
    const [temperatureLoading, setTemperatureLoading] = useState<boolean>(true);
    const [temperatureError, setTemperatureError] = useState<string | null>(null);
    const [temperatureThresholds, setTemperatureThresholds] = useState<{lower: number, upper: number}>({lower: 0, upper: 100});
    
    // Air Humidity state
    const [airHumidity, setAirHumidity] = useState<number | null>(null);
    const [airHumidityLoading, setAirHumidityLoading] = useState<boolean>(true);
    const [airHumidityError, setAirHumidityError] = useState<string | null>(null);
    const [airHumidityThresholds, setAirHumidityThresholds] = useState<{lower: number, upper: number}>({lower: 0, upper: 100});
    
    // Soil Moisture state
    const [soilMoisture, setSoilMoisture] = useState<number | null>(null);
    const [soilMoistureLoading, setSoilMoistureLoading] = useState<boolean>(true);
    const [soilMoistureError, setSoilMoistureError] = useState<string | null>(null);
    const [soilMoistureThresholds, setSoilMoistureThresholds] = useState<{lower: number, upper: number}>({lower: 0, upper: 100});
    
    // Clock update effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Sensor data fetch effect (Light intensity, Temperature, Air Humidity, Soil Moisture)
    useEffect(() => {
        const fetchSensorData = async () => {
            // Fetch light intensity data
            try {
                setLightLoading(true);
                const lightDevice = await getDeviceByNameApi("Cảm biến ánh sáng");
                setLightIntensity(lightDevice.value || 0);
                setLightThresholds({
                    lower: lightDevice.lower_threshold || 0,
                    upper: lightDevice.upper_threshold || 100
                });
                setLightError(null);
            } catch (err) {
                console.error("Error fetching light data:", err);
                setLightError("Failed to load light data");
                setLightIntensity(0);
            } finally {
                setLightLoading(false);
            }
            
            // Fetch temperature data
            try {
                setTemperatureLoading(true);
                const tempDevice = await getDeviceByNameApi("Cảm biến nhiệt độ");
                setTemperature(tempDevice.value || 0);
                setTemperatureThresholds({
                    lower: tempDevice.lower_threshold || 0,
                    upper: tempDevice.upper_threshold || 100
                });
                setTemperatureError(null);
            } catch (err) {
                console.error("Error fetching temperature data:", err);
                setTemperatureError("Failed to load temperature data");
                setTemperature(0);
            } finally {
                setTemperatureLoading(false);
            }
            
            // Fetch air humidity data
            try {
                setAirHumidityLoading(true);
                const airHumidityDevice = await getDeviceByNameApi("Cảm biến độ ẩm không khí");
                setAirHumidity(airHumidityDevice.value || 0);
                setAirHumidityThresholds({
                    lower: airHumidityDevice.lower_threshold || 0,
                    upper: airHumidityDevice.upper_threshold || 100
                });
                setAirHumidityError(null);
            } catch (err) {
                console.error("Error fetching air humidity data:", err);
                setAirHumidityError("Failed to load air humidity data");
                setAirHumidity(0);
            } finally {
                setAirHumidityLoading(false);
            }
            
            // Fetch soil moisture data
            try {
                setSoilMoistureLoading(true);
                const soilMoistureDevice = await getDeviceByNameApi("Cảm biến độ ẩm đất");
                setSoilMoisture(soilMoistureDevice.value || 0);
                setSoilMoistureThresholds({
                    lower: soilMoistureDevice.lower_threshold || 0,
                    upper: soilMoistureDevice.upper_threshold || 100
                });
                setSoilMoistureError(null);
            } catch (err) {
                console.error("Error fetching soil moisture data:", err);
                setSoilMoistureError("Failed to load soil moisture data");
                setSoilMoisture(0);
            } finally {
                setSoilMoistureLoading(false);
            }
        };

        // Initial fetch
        fetchSensorData();
        
        // Set up an interval to refresh the data periodically
        const intervalId = setInterval(fetchSensorData, 300000); // Refresh every 300 seconds (5 minutes)
        
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);
    
    const formattedDate = time.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const formattedTime = time.toLocaleTimeString("vi-VN");
    return (
        <div className="flex-1 p-4">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 bg-indigo-100 border border-indigo-200 rounded-xl p-6 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl text-blue-900">
                        Calendar
                    </h2>
                        <h1 className="inline-block mt-6 px-8 py-2 text-3xl rounded-full bg-indigo-300 font-bold text-white">{formattedTime}</h1>
                        <span className="inline-block mt-6 mb-6 px-8 py-2 text-3xl font-bold text-blue-500">📅 {formattedDate}</span>
                </div>

                <div className="flex-1 bg-blue-100 border border-blue-200 rounded-xl p-6 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl text-blue-900">
                        <strong>Area 1</strong>
                    </h2>
                    {(() => {
                        // Determine overall status based on all sensors
                        let statusClass = "bg-green-300 hover:bg-green-400";
                        let statusText = "Stable";
                        
                        // Check if any sensor has an error
                        if (lightError || temperatureError || airHumidityError || soilMoistureError) {
                            statusClass = "bg-red-300 hover:bg-red-400";
                            statusText = "Error";
                        }
                        // Check if any sensor is outside its thresholds
                        else if (
                            (lightIntensity !== null && (lightIntensity < lightThresholds.lower || lightIntensity > lightThresholds.upper)) ||
                            (temperature !== null && (temperature < temperatureThresholds.lower || temperature > temperatureThresholds.upper)) ||
                            (airHumidity !== null && (airHumidity < airHumidityThresholds.lower || airHumidity > airHumidityThresholds.upper)) ||
                            (soilMoisture !== null && (soilMoisture < soilMoistureThresholds.lower || soilMoisture > soilMoistureThresholds.upper))
                        ) {
                            statusClass = "bg-yellow-300 hover:bg-yellow-400";
                            statusText = "Warning";
                        }
                        
                        return (
                            <a className={`inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white ${statusClass} transition-transform duration-300 hover:scale-105`}>
                                {statusText}
                            </a>
                        );
                    })()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className=" bg-white rounded-xl shadow-lg p-6 h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-1">
                    <h3 className="text-xl font-bold text-indigo-800">Temperature</h3>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6">
                        {temperatureLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <strong>{temperature}</strong>
                        )}
                        <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-indigo-100 ml-2">
                        <svg className="h-8 w-8 text-blue-500"  width="32" height="32" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z"/>  <circle cx="6" cy="8" r="2" />  <path d="M20 9a3 3 0 0 0 -3 -3h-1a3 3 0 0 0 -3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3 -3" /></svg>
                        </span>
                    </h1>
                    <a className={`inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white ${
                        temperatureError ? 'bg-red-300 hover:bg-red-400' :
                        temperature !== null && temperature < temperatureThresholds.lower ? 'bg-blue-300 hover:bg-blue-400' :
                        temperature !== null && temperature > temperatureThresholds.upper ? 'bg-red-300 hover:bg-red-400' :
                        'bg-green-300 hover:bg-green-400'
                    } transition-transform duration-300 hover:scale-105`}>
                        {temperatureError ? "Error" :
                         temperature !== null && temperature < temperatureThresholds.lower ? "Low" :
                         temperature !== null && temperature > temperatureThresholds.upper ? "High" :
                         "Stable"}
                    </a>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-2">
                    <h3 className="text-xl font-bold text-indigo-800">Air Humidity</h3>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6">
                        {airHumidityLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <strong>{airHumidity}</strong>
                        )}
                        <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-indigo-100 ml-2">
                        <svg className="h-8 w-8 text-blue-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  <line x1="19" y1="5" x2="5" y2="19" />  <circle cx="6.5" cy="6.5" r="2.5" />  <circle cx="17.5" cy="17.5" r="2.5" /></svg>
                        </span>
                    </h1>
                    <a className={`inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white ${
                        airHumidityError ? 'bg-red-300 hover:bg-red-400' :
                        airHumidity !== null && airHumidity < airHumidityThresholds.lower ? 'bg-blue-300 hover:bg-blue-400' :
                        airHumidity !== null && airHumidity > airHumidityThresholds.upper ? 'bg-red-300 hover:bg-red-400' :
                        'bg-green-300 hover:bg-green-400'
                    } transition-transform duration-300 hover:scale-105`}>
                        {airHumidityError ? "Error" :
                         airHumidity !== null && airHumidity < airHumidityThresholds.lower ? "Low" :
                         airHumidity !== null && airHumidity > airHumidityThresholds.upper ? "High" :
                         "Stable"}
                    </a>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-3">
                    <h3 className="text-xl font-bold text-indigo-800">Soil Moisture</h3>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6">
                        {soilMoistureLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <strong>{soilMoisture}</strong>
                        )}
                        <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-indigo-100 ml-2">
                        <svg className="h-8 w-8 text-blue-500"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round">  <line x1="19" y1="5" x2="5" y2="19" />  <circle cx="6.5" cy="6.5" r="2.5" />  <circle cx="17.5" cy="17.5" r="2.5" /></svg>
                        </span>
                    </h1>
                    <a className={`inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white ${
                        soilMoistureError ? 'bg-red-300 hover:bg-red-400' :
                        soilMoisture !== null && soilMoisture < soilMoistureThresholds.lower ? 'bg-blue-300 hover:bg-blue-400' :
                        soilMoisture !== null && soilMoisture > soilMoistureThresholds.upper ? 'bg-red-300 hover:bg-red-400' :
                        'bg-green-300 hover:bg-green-400'
                    } transition-transform duration-300 hover:scale-105`}>
                        {soilMoistureError ? "Error" :
                         soilMoisture !== null && soilMoisture < soilMoistureThresholds.lower ? "Low" :
                         soilMoisture !== null && soilMoisture > soilMoistureThresholds.upper ? "High" :
                         "Stable"}
                    </a>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 h-64 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-3">
                    <h3 className="text-xl font-bold text-indigo-800">Light Intensity</h3>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6">
                        {lightLoading ? (
                            <span>Loading...</span>
                        ) : (
                            <strong>{lightIntensity}</strong>
                        )}
                        <span className="ml-2">Lux</span>
                    </h1>
                    <a className={`inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white ${
                        lightError ? 'bg-red-300 hover:bg-red-400' :
                        lightIntensity !== null && lightIntensity < lightThresholds.lower ? 'bg-blue-300 hover:bg-blue-400' :
                        lightIntensity !== null && lightIntensity > lightThresholds.upper ? 'bg-red-300 hover:bg-red-400' :
                        'bg-green-300 hover:bg-green-400'
                    } transition-transform duration-300 hover:scale-105`}>
                        {lightError ? "Error" :
                         lightIntensity !== null && lightIntensity < lightThresholds.lower ? "Low" :
                         lightIntensity !== null && lightIntensity > lightThresholds.upper ? "High" :
                         "Stable"}
                    </a>
                </div>
            </div>
        </div>
    )
}