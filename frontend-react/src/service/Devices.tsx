import { useState, useEffect } from "react";
import {
    getAllDevicesApi,
    Device,
    DeviceLog,
    getDeviceByNameApi,
    updateDeviceThresholdsApi
} from "../apiService";

export const Devices = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    // Removed buttons state as it's no longer needed
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
    const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);
    const [statsLoading, setStatsLoading] = useState<boolean>(false);
    const [isEditingThresholds, setIsEditingThresholds] = useState<boolean>(false);
    const [upperThreshold, setUpperThreshold] = useState<number>(0);
    const [lowerThreshold, setLowerThreshold] = useState<number>(0);
    const [updateLoading, setUpdateLoading] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    
    // No schedule form state needed
    
    // Removed getButtonNameForDevice function as it's no longer needed
    
    // OnOffButton component removed as it's no longer used

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Only fetch devices now
                const allDevices = await getAllDevicesApi();
                setDevices(allDevices);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
                setDevices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Set up an interval to refresh the data periodically
        const intervalId = setInterval(fetchData, 300000); // Refresh every 300 seconds (5 minutes)
        
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);
    
    // Effect to initialize button status has been removed as it's no longer needed

    // Function to fetch device statistics
    const fetchDeviceStats = async (deviceName: string) => {
        try {
            setStatsLoading(true);
            const device = await getDeviceByNameApi(deviceName);
            if (device && device.logs) {
                setDeviceLogs(device.logs);
            } else {
                setDeviceLogs([]);
            }
        } catch (error) {
            console.error("Error fetching device statistics:", error);
            setDeviceLogs([]);
        } finally {
            setStatsLoading(false);
        }
    };

    // Function to handle viewing device details
    const viewDeviceDetails = (device: Device) => {
        setSelectedDevice(device);
        setDetailsVisible(true);
        
        // Fetch statistics for the selected device
        fetchDeviceStats(device.name);
        
        // Scroll to the details section
        setTimeout(() => {
            const detailsSection = document.getElementById('device-details');
            if (detailsSection) {
                detailsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };
    
    // Function to handle editing thresholds
    const startEditingThresholds = () => {
        if (selectedDevice) {
            setUpperThreshold(selectedDevice.upper_threshold || 0);
            setLowerThreshold(selectedDevice.lower_threshold || 0);
            setIsEditingThresholds(true);
            setUpdateError(null);
        }
    };

    // Function to validate threshold values
    const validateThresholds = () => {
        // Check if values are not numbers
        if (isNaN(lowerThreshold) || isNaN(upperThreshold)) {
            setUpdateError("Threshold values must be valid numbers");
            return false;
        }
        
        // Check if lower threshold is greater than upper threshold
        if (lowerThreshold > upperThreshold) {
            setUpdateError("Lower threshold cannot be greater than upper threshold");
            return false;
        }
        
        // Check for negative values
        if (lowerThreshold < 0 || upperThreshold < 0) {
            setUpdateError("Threshold values cannot be negative");
            return false;
        }
        
        return true;
    };
    
    // Function to save updated thresholds
    const saveThresholds = async () => {
        if (!selectedDevice) return;
        
        // Validate thresholds before saving
        if (!validateThresholds()) {
            return;
        }
        
        try {
            setUpdateLoading(true);
            setUpdateError(null);
            
            // Log the values being sent to the API
            console.log("Sending threshold update:", {
                deviceId: selectedDevice._id,
                upper_threshold: upperThreshold,
                lower_threshold: lowerThreshold
            });
            
            // Call the API to update thresholds
            const updatedDevice = await updateDeviceThresholdsApi(
                selectedDevice._id,
                {
                    upper_threshold: upperThreshold,
                    lower_threshold: lowerThreshold
                }
            );
            
            // Log the response from the API
            console.log("API response:", updatedDevice);
            
            // Update the selected device with the values returned from the API
            setSelectedDevice(updatedDevice);
            
            // Update the device in the devices list using the API response
            setDevices(prevDevices => {
                return prevDevices.map(device => {
                    if (device._id === selectedDevice._id) {
                        return updatedDevice;
                    }
                    return device;
                });
            });
            
            // Exit editing mode
            setIsEditingThresholds(false);
        } catch (error) {
            console.error("Error updating thresholds:", error);
            setUpdateError(error instanceof Error ? error.message : "Failed to update thresholds");
        } finally {
            setUpdateLoading(false);
        }
    };
    
    // Function to cancel editing
    const cancelEditing = () => {
        setIsEditingThresholds(false);
        setUpdateError(null);
    };

    // Function to get appropriate icon for device type (for the device list)
    const getDeviceIcon = (deviceName: string, large: boolean = false) => {
        const sizeClass = large ? "w-60 h-60" : "w-10 h-10";
        
        if (deviceName.toLowerCase().includes("ánh sáng")) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={sizeClass}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
            );
        } else if (deviceName.toLowerCase().includes("nhiệt độ")) {
            return (
                <svg className={sizeClass} width="32" height="32" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z"/>
                    <circle cx="6" cy="8" r="2" />
                    <path d="M20 9a3 3 0 0 0 -3 -3h-1a3 3 0 0 0 -3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3 -3" />
                </svg>
            );
        } else if (deviceName.toLowerCase().includes("độ ẩm")) {
            return (
                <svg className={sizeClass} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.0001 13c0-.8883.4022-2.3826 1-3.27163M18.05 14c0 3.3137-2.6862 6-6 6-3.31366 0-5.99995-2.6863-5.99995-6S8.73634 4 12.05 4c3.3138 0 6 6.6863 6 10Z"/>
                </svg>
            );
        } else {
            // Default icon for other devices
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={sizeClass}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
            );
        }
    };
    
    // No schedule creation function needed
    
    // No device or button adding functions needed

    return (
        <div className="py-6 px-6 bg-indigo-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-900">All Devices</h1>
            </div>
            
            {/* No Add Device or Add Button forms needed */}
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-blue-500">Loading devices...</div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <div key={device._id} className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center mb-4">
                                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                                    {getDeviceIcon(device.name, false)}
                                </div>
                                <h2 className="text-xl font-bold text-blue-900">{device.name}</h2>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-gray-600">Channel: {device.channel}</p>
                                {device.value !== undefined && (
                                    <p className="text-2xl font-bold text-blue-500 mt-2">
                                        Current Value: {device.value}
                                        {device.name.toLowerCase().includes("ánh sáng") && " Lux"}
                                        {device.name.toLowerCase().includes("nhiệt độ") && " °C"}
                                        {device.name.toLowerCase().includes("độ ẩm") && " %"}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex justify-start items-center mt-4">
                                <button
                                    onClick={() => viewDeviceDetails(device)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                                >
                                    Device Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Device Details Section */}
            {selectedDevice && detailsVisible && (
                <div id="device-details" className="mt-10 border-t-2 border-indigo-200 pt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-900">Device Details</h2>
                        {isEditingThresholds ? (
                            <div className="space-x-2">
                                <button
                                    onClick={saveThresholds}
                                    disabled={updateLoading}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 disabled:opacity-50"
                                >
                                    {updateLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    disabled={updateLoading}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={startEditingThresholds}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                            >
                                Edit Thresholds
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Lower Threshold Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 h-75 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up">
                            <h1 className="text-center text-2xl md:text-3xl text-blue-900 pt-3 pb-6">
                                <strong>Lower Threshold</strong>
                            </h1>
                            
                            {isEditingThresholds ? (
                                <div className="flex flex-col items-center justify-center pt-6">
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            value={lowerThreshold}
                                            onChange={(e) => {
                                                setLowerThreshold(Number(e.target.value));
                                                // Clear error when user starts typing
                                                if (updateError) setUpdateError(null);
                                            }}
                                            className={`w-24 text-center text-3xl font-bold text-blue-500 border-2 ${
                                                updateError && (lowerThreshold > upperThreshold || lowerThreshold < 0)
                                                ? 'border-red-500'
                                                : 'border-blue-300'
                                            } rounded-lg p-2`}
                                        />
                                        <span className="ml-2 text-2xl text-blue-500">
                                            {selectedDevice.name.toLowerCase().includes("ánh sáng") && "Lux"}
                                            {selectedDevice.name.toLowerCase().includes("nhiệt độ") && "°C"}
                                            {selectedDevice.name.toLowerCase().includes("độ ẩm") && "%"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <h1 className="flex justify-center text-4xl md:text-5xl text-blue-500 pt-6">
                                    <strong>{selectedDevice.lower_threshold || 0}</strong>
                                    <span className="ml-2">
                                        {selectedDevice.name.toLowerCase().includes("ánh sáng") && "Lux"}
                                        {selectedDevice.name.toLowerCase().includes("nhiệt độ") && "°C"}
                                        {selectedDevice.name.toLowerCase().includes("độ ẩm") && "%"}
                                    </span>
                                </h1>
                            )}
                            
                            <div className="flex justify-center">
                                <a className="inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white bg-blue-300 hover:bg-blue-400 transition-transform duration-300 hover:scale-105">
                                    Minimum
                                </a>
                            </div>
                        </div>

                        {/* Current Value Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 h-75 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up">
                            <h1 className="text-center text-2xl md:text-3xl text-blue-900 pt-3 pb-6">
                                <strong>Current Value</strong>
                            </h1>
                            <h1 className="flex justify-center text-4xl md:text-5xl text-blue-500 pt-6">
                                <strong>{selectedDevice.value || 0}</strong>
                                <span className="ml-2">
                                    {selectedDevice.name.toLowerCase().includes("ánh sáng") && "Lux"}
                                    {selectedDevice.name.toLowerCase().includes("nhiệt độ") && "°C"}
                                    {selectedDevice.name.toLowerCase().includes("độ ẩm") && "%"}
                                </span>
                            </h1>
                            <div className="flex justify-center">
                                {(() => {
                                    // Determine status based on thresholds
                                    let statusClass = "bg-green-300 hover:bg-green-400";
                                    let statusText = "Stable";
                                    
                                    const currentValue = selectedDevice.value ?? 0;
                                    const lowerThreshold = selectedDevice.lower_threshold ?? 0;
                                    const upperThreshold = selectedDevice.upper_threshold ?? 100;
                                    
                                    if (currentValue < lowerThreshold) {
                                        statusClass = "bg-blue-300 hover:bg-blue-400";
                                        statusText = "Low";
                                    } else if (currentValue > upperThreshold) {
                                        statusClass = "bg-red-300 hover:bg-red-400";
                                        statusText = "High";
                                    }
                                    
                                    return (
                                        <a className={`inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white ${statusClass} transition-transform duration-300 hover:scale-105`}>
                                            {statusText}
                                        </a>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Upper Threshold Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 h-75 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up">
                            <h1 className="text-center text-2xl md:text-3xl text-blue-900 pt-3 pb-6">
                                <strong>Upper Threshold</strong>
                            </h1>
                            
                            {isEditingThresholds ? (
                                <div className="flex flex-col items-center justify-center pt-6">
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            value={upperThreshold}
                                            onChange={(e) => {
                                                setUpperThreshold(Number(e.target.value));
                                                // Clear error when user starts typing
                                                if (updateError) setUpdateError(null);
                                            }}
                                            className={`w-24 text-center text-3xl font-bold text-blue-500 border-2 ${
                                                updateError && (lowerThreshold > upperThreshold || upperThreshold < 0)
                                                ? 'border-red-500'
                                                : 'border-blue-300'
                                            } rounded-lg p-2`}
                                        />
                                        <span className="ml-2 text-2xl text-blue-500">
                                            {selectedDevice.name.toLowerCase().includes("ánh sáng") && "Lux"}
                                            {selectedDevice.name.toLowerCase().includes("nhiệt độ") && "°C"}
                                            {selectedDevice.name.toLowerCase().includes("độ ẩm") && "%"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <h1 className="flex justify-center text-4xl md:text-5xl text-blue-500 pt-6">
                                    <strong>{selectedDevice.upper_threshold || 0}</strong>
                                    <span className="ml-2">
                                        {selectedDevice.name.toLowerCase().includes("ánh sáng") && "Lux"}
                                        {selectedDevice.name.toLowerCase().includes("nhiệt độ") && "°C"}
                                        {selectedDevice.name.toLowerCase().includes("độ ẩm") && "%"}
                                    </span>
                                </h1>
                            )}
                            
                            <div className="flex justify-center">
                                <a className="inline-block mt-8 px-8 py-2 rounded-full text-xl font-bold text-white bg-red-300 hover:bg-red-400 transition-transform duration-300 hover:scale-105">
                                    Maximum
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    {/* Statistics Section */}
                    <div className="mt-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Device Statistics</h3>
                        
                        {statsLoading ? (
                            <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center">
                                <div className="text-blue-500">Loading statistics...</div>
                            </div>
                        ) : deviceLogs.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Data Table */}
                                <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Recent Readings</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white">
                                            <thead>
                                                <tr>
                                                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Time
                                                    </th>
                                                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Value
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deviceLogs.slice(0, 10).map((log, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                        <td className="py-2 px-4 border-b border-gray-200 text-sm">
                                                            {(() => {
                                                                // Parse timestamp correctly
                                                                const timestamp = log.timestamp;
                                                                const date = typeof timestamp === 'number' && timestamp < 10000000000
                                                                    ? new Date(timestamp * 1000)
                                                                    : new Date(timestamp);
                                                                return date.toLocaleString();
                                                            })()}
                                                        </td>
                                                        <td className="py-2 px-4 border-b border-gray-200 text-sm font-medium text-blue-600">
                                                            {log.value}
                                                            {selectedDevice?.name.toLowerCase().includes("ánh sáng") && " Lux"}
                                                            {selectedDevice?.name.toLowerCase().includes("nhiệt độ") && " °C"}
                                                            {selectedDevice?.name.toLowerCase().includes("độ ẩm") && " %"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                {/* Line Chart - Simplified Version */}
                                <div className="bg-white rounded-xl shadow-lg p-6 pb-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Value Trend</h4>
                                    
                                    {deviceLogs.length > 0 ? (
                                        <div className="relative h-64 border-b border-l border-gray-300">
                                            {/* Chart Component */}
                                            {(() => {
                                                // Helper function to parse timestamps
                                                const parseTimestamp = (timestamp: string | number) => {
                                                    if (typeof timestamp === 'number') {
                                                        // If timestamp is a small number (likely seconds since epoch), convert to milliseconds
                                                        if (timestamp < 10000000000) {
                                                            return new Date(timestamp * 1000);
                                                        }
                                                        // Otherwise it's already in milliseconds
                                                        return new Date(timestamp);
                                                    }
                                                    // Handle string timestamps
                                                    return new Date(timestamp);
                                                };
                                                
                                                // Process and sort logs
                                                const processedLogs = [...deviceLogs]
                                                    .map(log => ({
                                                        ...log,
                                                        parsedDate: parseTimestamp(log.timestamp),
                                                        value: Number(log.value)
                                                    }))
                                                    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
                                                    .slice(0, 15);
                                                
                                                if (processedLogs.length === 0) {
                                                    return (
                                                        <div className="h-64 flex items-center justify-center">
                                                            <p className="text-gray-500">No data available for chart</p>
                                                        </div>
                                                    );
                                                }
                                                
                                                // Find min and max values for Y-axis
                                                const values = processedLogs.map(log => log.value);
                                                const maxValue = Math.max(...values);
                                                const minValue = Math.min(...values);
                                                
                                                // Add padding to min/max to avoid points at the very edge
                                                // Use a larger padding (20%) to keep points well within the chart
                                                const padding = (maxValue - minValue) * 0.2 || 2;
                                                const yMax = maxValue + padding;
                                                const yMin = Math.max(0, minValue - padding); // Don't go below 0
                                                
                                                // Calculate Y-axis steps
                                                const yRange = yMax - yMin || 1;
                                                const yStep = yRange / 4;
                                                
                                                // Chart dimensions - use 85% of width and height to ensure more padding
                                                const chartWidth = 85; // percentage
                                                const chartHeight = 85; // percentage
                                                // Offset to center the chart
                                                const offsetX = 7; // percentage - increased to keep rightmost point in bounds
                                                const offsetY = 7; // percentage - increased for better vertical centering
                                                
                                                // Create SVG elements
                                                const svgElements = [];
                                                
                                                // Add line segments
                                                if (processedLogs.length > 1) {
                                                    for (let i = 0; i < processedLogs.length - 1; i++) {
                                                        const current = processedLogs[i];
                                                        const next = processedLogs[i + 1];
                                                        
                                                        // Calculate positions with offset
                                                        const x1 = offsetX + (i / (processedLogs.length - 1)) * chartWidth;
                                                        const y1 = offsetY + chartHeight - ((current.value - yMin) / yRange) * chartHeight;
                                                        const x2 = offsetX + ((i + 1) / (processedLogs.length - 1)) * chartWidth;
                                                        const y2 = offsetY + chartHeight - ((next.value - yMin) / yRange) * chartHeight;
                                                        
                                                        // Add line segment
                                                        svgElements.push(
                                                            <line
                                                                key={`line-${i}`}
                                                                x1={`${x1}%`}
                                                                y1={`${y1}%`}
                                                                x2={`${x2}%`}
                                                                y2={`${y2}%`}
                                                                stroke="#3B82F6"
                                                                strokeWidth="2"
                                                            />
                                                        );
                                                    }
                                                }
                                                
                                                // Add data points
                                                processedLogs.forEach((log, i) => {
                                                    const x = offsetX + (i / (processedLogs.length - 1 || 1)) * chartWidth;
                                                    const y = offsetY + chartHeight - ((log.value - yMin) / yRange) * chartHeight;
                                                    
                                                    svgElements.push(
                                                        <g key={`point-${i}`} className="group">
                                                            <circle
                                                                cx={`${x}%`}
                                                                cy={`${y}%`}
                                                                r="4"
                                                                fill="#3B82F6"
                                                            />
                                                            <text
                                                                x={`${x}%`}
                                                                y={`${y - 10}%`}
                                                                textAnchor="middle"
                                                                fill="#1E40AF"
                                                                fontSize="10"
                                                                opacity="0"
                                                                className="group-hover:opacity-100"
                                                            >
                                                                {log.value}
                                                                {selectedDevice?.name.toLowerCase().includes("ánh sáng") && " Lux"}
                                                                {selectedDevice?.name.toLowerCase().includes("nhiệt độ") && " °C"}
                                                                {selectedDevice?.name.toLowerCase().includes("độ ẩm") && " %"}
                                                            </text>
                                                        </g>
                                                    );
                                                });
                                                
                                                // Create X-axis labels
                                                const xLabels = [];
                                                const labelCount = Math.min(5, processedLogs.length);
                                                
                                                for (let i = 0; i < labelCount; i++) {
                                                    const index = Math.floor(i * (processedLogs.length - 1) / (labelCount - 1));
                                                    const log = processedLogs[index];
                                                    const time = log.parsedDate;
                                                    const label = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;
                                                    // Use the same offset and width as the chart
                                                    // Calculate x position exactly the same way as data points to ensure alignment
                                                    // Add a small offset (4%) to shift the labels slightly to the right for better alignment
                                                    const x = offsetX + (index / (processedLogs.length - 1 || 1)) * chartWidth + 4;
                                                    
                                                    xLabels.push({ label, x });
                                                }
                                                
                                                return (
                                                    <>
                                                        {/* Y-axis labels */}
                                                        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                                                            {[0, 1, 2, 3, 4].map(i => (
                                                                <div key={i} className="text-right pr-2">
                                                                    {Math.round((yMin + yStep * (4 - i)) * 100) / 100}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Grid lines */}
                                                        <div className="absolute left-12 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none">
                                                            {[0, 1, 2, 3, 4].map(i => (
                                                                <div key={i} className="border-t border-gray-200 w-full"></div>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Line Chart */}
                                                        <svg className="absolute left-12 right-0 top-0 bottom-0 h-full w-[calc(100%-12px)]">
                                                            {svgElements}
                                                        </svg>
                                                        
                                                        {/* X-axis labels */}
                                                        <div className="absolute left-12 right-0 bottom-[-12px] text-xs text-gray-500">
                                                            {xLabels.map((item, i) => (
                                                                <div key={i} style={{ position: 'absolute', left: `${item.x}%`, transform: 'translateX(-50%)', width: '40px', textAlign: 'center' }}>
                                                                    {item.label}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="h-64 flex items-center justify-center">
                                            <p className="text-gray-500">No data available for chart</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Statistics Summary */}
                                <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:col-span-2">
                                    <h4 className="text-lg font-semibold text-blue-800 mb-3">Statistics Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {(() => {
                                            // Helper function to parse timestamps
                                            const parseTimestamp = (timestamp: string | number) => {
                                                if (typeof timestamp === 'number') {
                                                    // If timestamp is a small number (likely seconds since epoch), convert to milliseconds
                                                    if (timestamp < 10000000000) {
                                                        return new Date(timestamp * 1000);
                                                    }
                                                    // Otherwise it's already in milliseconds
                                                    return new Date(timestamp);
                                                }
                                                // Handle string timestamps
                                                return new Date(timestamp);
                                            };
                                            
                                            // Sort logs by timestamp (newest first)
                                            const sortedLogs = [...deviceLogs]
                                                .map(log => ({
                                                    ...log,
                                                    parsedDate: parseTimestamp(log.timestamp),
                                                    value: Number(log.value)
                                                }))
                                                .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime()); // Descending order (newest first)
                                            
                                            const values = sortedLogs.map(log => log.value);
                                            const max = Math.max(...values);
                                            const min = Math.min(...values);
                                            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                                            const latest = values[0] || 0; // Now this is truly the latest value
                                            
                                            const stats = [
                                                { label: "Latest", value: latest },
                                                { label: "Average", value: avg },
                                                { label: "Maximum", value: max },
                                                { label: "Minimum", value: min }
                                            ];
                                            
                                            return stats.map((stat, index) => (
                                                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                                                    <div className="text-gray-500 text-sm">{stat.label}</div>
                                                    <div className="text-blue-600 text-2xl font-bold mt-1">
                                                        {Math.round(stat.value * 100) / 100}
                                                        <span className="text-sm ml-1">
                                                            {selectedDevice?.name.toLowerCase().includes("ánh sáng") && "Lux"}
                                                            {selectedDevice?.name.toLowerCase().includes("nhiệt độ") && "°C"}
                                                            {selectedDevice?.name.toLowerCase().includes("độ ẩm") && "%"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                                <p className="text-gray-500">No statistics available for this device.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Schedule Section removed */}
                    
                    {/* Error message for threshold update */}
                    {updateError && (
                        <div className="mt-4 bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg shadow-md relative animate-pulse" role="alert">
                            <strong className="font-bold text-lg">Invalid Input!</strong>
                            <span className="block sm:inline text-base ml-2">{updateError}</span>
                            <button
                                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                                onClick={() => setUpdateError(null)}
                                aria-label="Close"
                            >
                                <span className="text-red-500 text-xl font-bold">×</span>
                            </button>
                        </div>
                    )}
                    
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setDetailsVisible(false)}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors duration-300"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};