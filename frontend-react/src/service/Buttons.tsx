import { useState, useEffect } from "react";
import {
    getAllButtonsApi,
    Button,
    controlButtonViaMqttApi,
    createScheduleApi,
    getSchedulesByButtonIdApi,
    updateScheduleApi,
    deleteScheduleApi,
    Schedule
} from "../apiService";

export const Buttons = () => {
    const [buttons, setButtons] = useState<Button[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);
    const [selectedButton, setSelectedButton] = useState<Button | null>(null);
    const [scheduleVisible, setScheduleVisible] = useState<boolean>(false);
    
    // Schedule form state
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [isRecurring, setIsRecurring] = useState<boolean>(true);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
    const [scheduleSuccess, setScheduleSuccess] = useState<boolean>(false);
    
    // Schedules state
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState<boolean>(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    useEffect(() => {
        const fetchButtons = async () => {
            try {
                setLoading(true);
                const allButtons = await getAllButtonsApi();
                setButtons(allButtons);
                
                // Initialize toggle states based on button status
                const initialStates: Record<string, boolean> = {};
                allButtons.forEach(button => {
                    initialStates[button._id] = button.status.toLowerCase() === 'on';
                });
                setToggleStates(initialStates);
                
                setError(null);
            } catch (err) {
                console.error("Error fetching buttons:", err);
                setError("Failed to load buttons");
                setButtons([]);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchButtons();
        
        // Set up an interval to refresh the data periodically
        const intervalId = setInterval(fetchButtons, 30000); // Refresh every 30 seconds
        
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    const handleToggle = async (buttonId: string) => {
        try {
            console.log(`Toggle button clicked for button ID: ${buttonId}`);
            
            setActionInProgress(buttonId);
            const currentState = toggleStates[buttonId];
            console.log(`Current state for button ${buttonId}: ${currentState ? 'ON' : 'OFF'}`);
            
            const newState = !currentState;
            console.log(`New state for button ${buttonId}: ${newState ? 'ON' : 'OFF'}`);
            
            const status = newState ? 'On' : 'Off'; // Capitalized to match backend expectations
            console.log(`Setting status to: ${status}`);
            
            // Call MQTT API to control the button
            // This will both control the button via MQTT and update the database
            console.log(`Calling controlButtonViaMqttApi for button ${buttonId} with status ${status}`);
            const result = await controlButtonViaMqttApi(buttonId, status);
            console.log(`API call result:`, result);
            
            // Update local state
            console.log(`Updating local toggle state for button ${buttonId} to ${newState}`);
            setToggleStates(prev => ({
                ...prev,
                [buttonId]: newState
            }));
            
        } catch (err) {
            console.error(`Error toggling button ${buttonId}:`, err);
            // Revert the toggle state in case of error
            alert(`Failed to control button: ${err}`);
        } finally {
            setActionInProgress(null);
        }
    };
    
    // Function to handle schedule creation
    const handleCreateSchedule = async () => {
        if (!selectedButton || !startTime || !endTime || selectedDays.length === 0) {
            alert("Please fill in all required fields and select at least one day of the week.");
            return;
        }
        
        try {
            setScheduleLoading(true);
            setScheduleSuccess(false);
            
            // Create schedule data
            const scheduleData: Schedule = {
                channel: selectedButton.channel,
                start_time: startTime,
                end_time: endTime,
                is_recurring: isRecurring,
                days_of_week: selectedDays
            };
            
            console.log("Creating schedule with data:", scheduleData);
            
            // Call the API to create the schedule
            const result = await createScheduleApi(scheduleData);
            console.log("Schedule created successfully:", result);
            
            // Fetch updated schedules after creating a new one
            if (selectedButton) {
                try {
                    const updatedSchedules = await getSchedulesByButtonIdApi(selectedButton._id);
                    setSchedules(updatedSchedules);
                } catch (error) {
                    console.error("Error fetching updated schedules:", error);
                }
            }
            
            // Show success message
            setScheduleSuccess(true);
            
            // Reset form after a delay
            setTimeout(() => {
                setScheduleSuccess(false);
            }, 3000);
            
        } catch (error) {
            console.error("Error creating schedule:", error);
            alert(`Failed to create schedule: ${error}`);
        } finally {
            setScheduleLoading(false);
        }
    };
    
    // Function to show schedule form for a button
    const showScheduleForm = async (button: Button) => {
        try {
            setSelectedButton(button);
            setScheduleVisible(true);
            setLoadingSchedules(true);
            setSchedules([]); // Clear existing schedules first
            
            // Fetch schedules for this button
            console.log("Fetching schedules for button ID:", button._id);
            const buttonSchedules = await getSchedulesByButtonIdApi(button._id);
            console.log("Fetched schedules:", buttonSchedules);
            
            // Ensure buttonSchedules is an array
            if (Array.isArray(buttonSchedules)) {
                console.log("Raw schedules from API:", JSON.stringify(buttonSchedules));
                
                // Log each schedule to inspect its structure
                buttonSchedules.forEach((schedule, index) => {
                    console.log(`Schedule ${index}:`, schedule);
                    if (schedule) {
                        console.log(`  _id: ${schedule._id}`);
                        console.log(`  start_time: ${schedule.start_time}`);
                        console.log(`  end_time: ${schedule.end_time}`);
                        console.log(`  is_recurring: ${schedule.is_recurring}`);
                        console.log(`  days_of_week:`, schedule.days_of_week);
                    }
                });
                
                setSchedules(buttonSchedules);
            } else {
                console.error("API did not return an array:", buttonSchedules);
                setSchedules([]);
            }
        } catch (error) {
            console.error("Error in showScheduleForm:", error);
            setSchedules([]);
        } finally {
            setLoadingSchedules(false);
        }
        
        // Scroll to the schedule section
        setTimeout(() => {
            const scheduleSection = document.getElementById('button-schedule');
            if (scheduleSection) {
                scheduleSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };
    
    // Function to handle editing a schedule
    const handleEditSchedule = (schedule: Schedule) => {
        console.log("Editing schedule:", schedule);
        console.log("Original start time:", schedule.start_time);
        console.log("Original end time:", schedule.end_time);
        
        // Ensure time values are in the correct format for the time input (HH:MM)
        // The time input expects a string in the format "HH:MM" (24-hour format)
        const formattedStartTime = schedule.start_time;
        const formattedEndTime = schedule.end_time;
        
        // Set the editing schedule and form values
        setEditingSchedule(schedule);
        setStartTime(formattedStartTime);
        setEndTime(formattedEndTime);
        setIsRecurring(schedule.is_recurring);
        setSelectedDays(schedule.days_of_week.length > 0 ? schedule.days_of_week : []);
        
        console.log("Set start time to:", formattedStartTime);
        console.log("Set end time to:", formattedEndTime);
    };
    
    // Function to handle updating a schedule
    const handleUpdateSchedule = async () => {
        if (!editingSchedule || !editingSchedule._id || !startTime || !endTime || selectedDays.length === 0) {
            alert("Please fill in all required fields and select at least one day of the week.");
            return;
        }
        
        try {
            setScheduleLoading(true);
            setScheduleSuccess(false);
            
            // Create updated schedule data without including the _id field
            // to avoid MongoDB immutable field error
            const updatedScheduleData: Schedule = {
                channel: editingSchedule.channel,
                start_time: startTime,
                end_time: endTime,
                is_recurring: isRecurring,
                days_of_week: selectedDays
            };
            
            console.log("Updating schedule with data:", updatedScheduleData);
            
            // Call the API to update the schedule
            const result = await updateScheduleApi(editingSchedule._id, updatedScheduleData);
            console.log("Schedule updated successfully:", result);
            
            // Fetch updated schedules after updating
            if (selectedButton) {
                try {
                    const updatedSchedules = await getSchedulesByButtonIdApi(selectedButton._id);
                    setSchedules(updatedSchedules);
                } catch (error) {
                    console.error("Error fetching updated schedules:", error);
                }
            }
            
            // Show success message
            setScheduleSuccess(true);
            
            // Reset form after a delay
            setTimeout(() => {
                setScheduleSuccess(false);
                setEditingSchedule(null);
            }, 3000);
            
        } catch (error) {
            console.error("Error updating schedule:", error);
            alert(`Failed to update schedule: ${error}`);
        } finally {
            setScheduleLoading(false);
        }
    };
    
    // Function to handle deleting a schedule
    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!scheduleId) return;
        
        if (!confirm("Are you sure you want to delete this schedule?")) {
            return;
        }
        
        try {
            const result = await deleteScheduleApi(scheduleId);
            console.log("Schedule deleted successfully:", result);
            
            // Fetch updated schedules after deletion
            if (selectedButton) {
                try {
                    const updatedSchedules = await getSchedulesByButtonIdApi(selectedButton._id);
                    setSchedules(updatedSchedules);
                } catch (error) {
                    console.error("Error fetching updated schedules:", error);
                }
            }
            
        } catch (error) {
            console.error("Error deleting schedule:", error);
            alert(`Failed to delete schedule: ${error}`);
        }
    };
    
    // Function to cancel editing
    const handleCancelEdit = () => {
        setEditingSchedule(null);
        setStartTime("");
        setEndTime("");
        setIsRecurring(true);
        setSelectedDays([]);
    };

    // Function to get appropriate icon for button type
    const getButtonIcon = (buttonName: string) => {
        if (buttonName.toLowerCase().includes("đèn")) {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
            );
        } else if (buttonName.toLowerCase().includes("quạt")) {
            return (
                <svg className="w-10 h-10" width="32" height="32" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z"/>
                    <circle cx="6" cy="8" r="2" />
                    <path d="M20 9a3 3 0 0 0 -3 -3h-1a3 3 0 0 0 -3 3v6a3 3 0 0 0 3 3h1a3 3 0 0 0 3 -3" />
                </svg>
            );
        } else if (buttonName.toLowerCase().includes("máy bơm") || buttonName.toLowerCase().includes("bơm")) {
            return (
                <svg className="w-10 h-10" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.0001 13c0-.8883.4022-2.3826 1-3.27163M18.05 14c0 3.3137-2.6862 6-6 6-3.31366 0-5.99995-2.6863-5.99995-6S8.73634 4 12.05 4c3.3138 0 6 6.6863 6 10Z"/>
                </svg>
            );
        } else {
            // Default icon for other buttons
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
            );
        }
    };

    return (
        <div className="py-6 px-6 bg-indigo-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-blue-900">Control Buttons</h1>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-xl text-blue-500">Loading buttons...</div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buttons.map((button) => (
                        <div key={button._id} className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="flex items-center mb-4">
                                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                                    {getButtonIcon(button.name)}
                                </div>
                                <h2 className="text-xl font-bold text-blue-900">{button.name}</h2>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-gray-600">Channel: {button.channel}</p>
                                <p className="text-gray-600">Status: 
                                    <span className={`ml-2 font-semibold ${toggleStates[button._id] ? 'text-green-600' : 'text-red-600'}`}>
                                        {toggleStates[button._id] ? 'ON' : 'OFF'}
                                    </span>
                                </p>
                            </div>
                            
                            <div className="flex justify-between mt-4">
                                <button
                                    onClick={() => handleToggle(button._id)}
                                    disabled={actionInProgress === button._id}
                                    className={`
                                        relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
                                        focus-visible:ring-white focus-visible:ring-opacity-75
                                        ${toggleStates[button._id] ? 'bg-green-500' : 'bg-gray-300'}
                                        ${actionInProgress === button._id ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <span
                                        className={`
                                            pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full 
                                            bg-white shadow-lg ring-0 transition duration-200 ease-in-out
                                            ${toggleStates[button._id] ? 'translate-x-9' : 'translate-x-0'}
                                        `}
                                    />
                                </button>
                                
                                <button
                                    onClick={() => showScheduleForm(button)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300"
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Button Schedule Section */}
            {selectedButton && scheduleVisible && (
                <div id="button-schedule" className="mt-10 border-t-2 border-indigo-200 pt-6">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6">Button Schedule</h2>
                    
                    {/* Existing Schedules Section */}
                    {loadingSchedules ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <p className="text-center text-gray-600">Loading schedules...</p>
                        </div>
                    ) : schedules.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <h4 className="text-lg font-semibold text-blue-800 mb-3">
                                Existing Schedules for {selectedButton.name} ({schedules.length})
                            </h4>
                            
                            <div className="space-y-4">
                                {schedules.map((schedule, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">
                                                    <span className="text-blue-600">{schedule.start_time}</span> to <span className="text-blue-600">{schedule.end_time}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {schedule.days_of_week.length > 1 ? 'Days' : 'Day'}:
                                                    <span className="font-medium"> {schedule.days_of_week.join(', ')}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {schedule.is_recurring ? 'Recurring' : 'One-time'} schedule
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditSchedule(schedule)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => schedule._id ? handleDeleteSchedule(schedule._id) : alert('Cannot delete: No schedule ID')}
                                                    disabled={!schedule._id}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <p className="text-center text-gray-600">No schedules found for this button.</p>
                        </div>
                    )}
                    
                    {/* Create/Edit Schedule Form */}
                    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                        <h4 className="text-lg font-semibold text-blue-800 mb-3">
                            {editingSchedule ? `Edit Schedule for ${selectedButton.name}` : `Set Schedule for ${selectedButton.name}`}
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                    <div key={day} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`day-${day}`}
                                            checked={selectedDays.includes(day)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDays([...selectedDays, day]);
                                                } else {
                                                    setSelectedDays(selectedDays.filter(d => d !== day));
                                                }
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`day-${day}`} className="ml-2 block text-sm text-gray-700">
                                            {day}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center mb-4">
                            <input
                                type="checkbox"
                                id="recurring"
                                checked={isRecurring}
                                onChange={(e) => setIsRecurring(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                                Recurring Schedule
                            </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            {editingSchedule ? (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleUpdateSchedule}
                                        disabled={scheduleLoading || !startTime || !endTime}
                                        className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ${
                                            (scheduleLoading || !startTime || !endTime) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        {scheduleLoading ? 'Updating...' : 'Update Schedule'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleCreateSchedule()}
                                    disabled={scheduleLoading || !startTime || !endTime}
                                    className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ${
                                        (scheduleLoading || !startTime || !endTime) ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {scheduleLoading ? 'Creating...' : 'Create Schedule'}
                                </button>
                            )}
                            
                            {scheduleSuccess && (
                                <div className="text-green-600 font-medium">
                                    {editingSchedule ? 'Schedule updated successfully!' : 'Schedule created successfully!'}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => {
                                setScheduleVisible(false);
                                setEditingSchedule(null);
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition-colors duration-300"
                        >
                            Close Schedule
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};