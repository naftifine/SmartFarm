import React, { useState, useEffect, useRef } from "react";
import { getAllNotificationsApi, getUnreadNotificationsApi, markAllNotificationsAsReadApi, Notification } from "../apiService";

export const Container = () => {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState("Username");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    // Fetch notifications and unread count
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const allNotifications = await getAllNotificationsApi();
            const unreadNotifications = await getUnreadNotificationsApi();
            
            setNotifications(allNotifications);
            setUnreadCount(unreadNotifications.length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        // Get username from localStorage when component mounts
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
        
        // Fetch notifications when component mounts
        fetchNotifications();
        
        // Set up interval to check for new notifications every minute
        const intervalId = setInterval(fetchNotifications, 60000);
        
        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // Handle clicks outside of notification dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (open &&
                notificationRef.current &&
                buttonRef.current &&
                !notificationRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)) {
                setOpen(false);
                
                // If there are unread notifications, mark them as read
                if (unreadCount > 0) {
                    markAllAsRead();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, unreadCount]);
    
    const handleOpen = () => {
        setOpen(!open);
        
        // If opening the notification panel and there are unread notifications, mark them as read
        if (!open && unreadCount > 0) {
            markAllAsRead();
        }
    };
    
    const markAllAsRead = async () => {
        try {
            await markAllNotificationsAsReadApi();
            // Update local state to reflect all notifications as read
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({
                    ...notification,
                    isRead: true
                }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    };
    return (
    <div className="bg-indigo-50 min-h-screen overflow-x-hidden">
    <div className="fixed w-full bg-white text-indigo-800 z-50 shadow-lg animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center h-16">
            <span className="text-xl font-bold text-blue-900">
                DADN
            </span>
            <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={handleOpen}
                title="Notification" className=" rounded-full items-center bg-white p-2 hover:shadow-xl transition-shadow duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8  cursor-pointer hover:text-indigo-800 transition-transform duration-300 hover:scale-120 pr-1">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
              </button>
              {/* Notification badge */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
              
              {/* Notification dropdown */}
              {open && (
                <div ref={notificationRef} className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 max-h-[400px] overflow-y-auto">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
                      {loading && <span className="text-sm text-gray-500">Đang tải...</span>}
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        Không có thông báo nào
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-3 rounded-lg ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium text-gray-800">{notification.title}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-100 p-3 text-center">
                    <button
                      className="bg-gray-100 p-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full"
                      onClick={handleOpen}
                    >
                      Ok, Got it
                    </button>
                  </div>
                </div>
              )}
            </div>
                <span className="material-icons-outlined p-2 text-2xl hidden md:block">{username}</span>
                <img className="w-10 h-10 rounded-full transition-transform object-cover" 
                     src="/src/images/meo.jpg" 
                     alt="Profile"/>
            </div>
        </div>
    </div>

</div>
    )
}