import { useEffect } from 'react';
import { logoutUser } from '../apiService';
import { useNavigate } from 'react-router-dom';

export const Sidebar = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const homeButton = document.getElementById("homeButton");
        if (homeButton) {
            homeButton.addEventListener("click", () => {
                window.location.href = "/home";
            });
        }
        return () => {
            if (homeButton) {
                homeButton.removeEventListener("click", () => {
                    window.location.href = "/home";
                });
            }
        };
    }
    , []);
    useEffect(() => {
        const devicesButton = document.getElementById("devicesButton");
        if (devicesButton) {
            devicesButton.addEventListener("click", () => {
                window.location.href = "/devices";
            });
        }
        return () => {
            if (devicesButton) {
                devicesButton.removeEventListener("click", () => {
                    window.location.href = "/devices";
                });
            }
        };
    }
    , []);
    useEffect(() => {
        const buttonsButton = document.getElementById("buttonsButton");
        if (buttonsButton) {
            buttonsButton.addEventListener("click", () => {
                window.location.href = "/buttons";
            });
        }
        return () => {
            if (buttonsButton) {
                buttonsButton.removeEventListener("click", () => {
                    window.location.href = "/buttons";
                });
            }
        };
    }
    , []);
    useEffect(() => {
        const logoutButton = document.getElementById("logoutButton");
        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                try {
                    // Call the logout API
                    await logoutUser();
                    // Redirect to login page
                    navigate('/');
                } catch (error) {
                    console.error('Logout failed:', error);
                    // Even if the API call fails, redirect to login page
                    navigate('/');
                }
            });
        }
        return () => {
            if (logoutButton) {
                logoutButton.removeEventListener("click", () => {});
            }
        };
    }
    , [navigate]);
    return (
        <div className="pt-16 max-w-7xl mx-auto flex fixed">
        <div className="sidebar fixed lg:static w-[100px] bg-indigo-50 h-screen transform duration-300 z-10 p-4 pt-1 pb-1">
            <button id="homeButton" className="bg-white rounded-xl shadow-lg mb-6 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" title="Home">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            </button>
            <button id="devicesButton" className="bg-white rounded-xl shadow-lg mb-6 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" title="Devices">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
            </svg>
            </button>
            <button id="buttonsButton" className="bg-white rounded-xl shadow-lg mb-6 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" title="Buttons">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            </button>
            <button id="logoutButton" className="bg-white rounded-xl shadow-lg mb-6 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" title="Logout">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            </button>
        </div>
        </div>
    )
}