import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { OnOffButton } from "../components/onoffButton";
import { getDeviceByNameApi, getAllDevicesApi, Device } from "../apiService";

export const Light = () => {
    const { id } = useParams<{ id: string }>();
    const [device, setDevice] = useState<Device | null>(null);
    const [lightIntensity, setLightIntensity] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDeviceData = async () => {
            try {
                setLoading(true);
                
                let deviceData: Device;
                
                if (id) {
                    // If we have an ID from the URL, fetch all devices and find the one with matching ID
                    const allDevices = await getAllDevicesApi();
                    const foundDevice = allDevices.find(d => d._id === id);
                    
                    if (!foundDevice) {
                        throw new Error("Device not found");
                    }
                    
                    deviceData = foundDevice;
                } else {
                    // Default to light sensor if no ID is provided
                    deviceData = await getDeviceByNameApi("Cảm biến ánh sáng");
                }
                
                setDevice(deviceData);
                setLightIntensity(deviceData.value || 0);
                setError(null);
            } catch (err) {
                console.error("Error fetching device data:", err);
                setError("Failed to load device data");
                setLightIntensity(0);
            } finally {
                setLoading(false);
            }
        };

        fetchDeviceData();
        
        // Set up an interval to refresh the data periodically
        const intervalId = setInterval(fetchDeviceData, 300000); // Refresh every 300 seconds (5 minutes)
        
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [id]); // Re-run when the ID changes

    // Function to get appropriate icon for device type
    const getDeviceIcon = () => {
        if (!device) return null;
        
        if (device.name.toLowerCase().includes("ánh sáng")) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-60 h-60">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
            );
        } else if (device.name.toLowerCase().includes("nhiệt độ")) {
            return (
                <svg className="w-60 h-60" width="32" height="32" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z"/>
                    <circle cx="6" cy="8" r="2" />
                    <path d="M20 9a3 3 0 0 0 -3 -3h-1a3 3 0 0 0 -3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3 -3" />
                </svg>
            );
        } else if (device.name.toLowerCase().includes("độ ẩm")) {
            return (
                <svg className="w-60 h-60" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.0001 13c0-.8883.4022-2.3826 1-3.27163M18.05 14c0 3.3137-2.6862 6-6 6-3.31366 0-5.99995-2.6863-5.99995-6S8.73634 4 12.05 4c3.3138 0 6 6.6863 6 10Z"/>
                </svg>
            );
        } else {
            // Default icon for other devices
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-60 h-60">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
            );
        }
    };
    
    // Function to get the appropriate unit for the device
    const getValueUnit = () => {
        if (!device) return "";
        
        if (device.name.toLowerCase().includes("ánh sáng")) {
            return "Lux";
        } else if (device.name.toLowerCase().includes("nhiệt độ")) {
            return "°C";
        } else if (device.name.toLowerCase().includes("độ ẩm")) {
            return "%";
        } else {
            return "";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className=" bg-white rounded-xl shadow-lg p-6 h-115 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-1">
                    <h1 className="text-center text-2xl md:text-4xl text-blue-900 pt-3 pb-6">
                        <strong>{loading ? "Loading..." : device?.name || "Device"}</strong>
                    </h1>
                    <span className="flex items-center justify-center ">
                        {getDeviceIcon()}
                    </span>
                    <div className="flex items-center justify-center mt-8">
                        <OnOffButton/>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 h-75 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up delay-2">
                    <h1 className="text-center text-2xl md:text-4xl text-blue-900 pt-3 pb-6">
                        <strong>Current Value</strong>
                    </h1>
                    <h1 className="flex text-4xl md:text-5xl text-blue-500 pt-6 ml-50">
                        {loading ? (
                            <span>Loading...</span>
                        ) : (
                            <>
                                <strong>{lightIntensity}</strong>
                                <span className="ml-2">{getValueUnit()}</span>
                            </>
                        )}
                        <span className="w-[50px] h-[50px] flex items-center justify-center rounded-full bg-indigo-100 ml-2">
                        <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <line x1="19" y1="5" x2="5" y2="19" />  <circle cx="6.5" cy="6.5" r="2.5" />  <circle cx="17.5" cy="17.5" r="2.5" /></svg>
                        </span>
                    </h1>
                    <a className="inline-block mt-8 ml-50 px-8 py-2 rounded-full text-xl font-bold text-white bg-green-300 hover:bg-green-400 transition-transform duration-300 hover:scale-105">
                        {error ? "Error" : "Stable"}
                    </a>
                </div>
        </div>
    );
};