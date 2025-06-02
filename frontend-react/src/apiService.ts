// frontend-react/src/apiService.ts

const API_BASE_URL = 'http://localhost:3000'; // Địa chỉ backend

// --- Hàm gọi API Đăng ký ---
export const signupUser = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json(); // Parse JSON response

    if (response.ok) { // Kiểm tra mã trạng thái HTTP 2xx (ví dụ 201 Created)
      console.log('Signup successful:', data);
      return true; // Trả về true nếu thành công
    } else {
      // Xử lý lỗi dựa trên mã trạng thái hoặc thông báo từ backend
      console.error('Signup failed:', data.error || response.statusText);
      // Ném lỗi để component gọi hàm có thể bắt và hiển thị
      throw new Error(data.error || 'Đăng ký thất bại');
    }
  } catch (error) {
    console.error('Error during signup:', error);
    // Ném lỗi để component gọi hàm có thể bắt
    throw error;
  }
};

// --- Hàm gọi API Đăng nhập ---
export const loginUser = async (username: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json(); // Parse JSON response

    if (response.ok) { // Kiểm tra mã trạng thái HTTP 2xx (ví dụ 200 OK)
      console.log('Login successful:', data);
      // --- Xử lý dữ liệu phản hồi thành công ---
      // Nếu backend trả về token hoặc thông tin user khác, bạn cần lưu lại ở đây.
      // Ví dụ: localStorage.setItem('authToken', data.token);
      // Lưu ý: API doc bạn cung cấp chỉ trả về { message: 'Login successful' } khi thành công,
      // thực tế thường sẽ trả về token hoặc user info. Bạn cần điều chỉnh tùy thuộc BE trả về gì.
      
      // Store authentication state and username in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      
      return true; // Trả về true nếu thành công
    } else {
      // Xử lý lỗi dựa trên mã trạng thái (401 Unauthorized) hoặc thông báo từ backend
      console.error('Login failed:', data.error || response.statusText);
       // Ném lỗi để component gọi hàm có thể bắt và hiển thị
      throw new Error(data.error || 'Đăng nhập thất bại');
    }
  } catch (error) {
    console.error('Error during login:', error);
     // Ném lỗi để component gọi hàm có thể bắt
    throw error;
  }
};

// --- Hàm gọi API Đăng xuất ---
export const logoutUser = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Logout successful:', data);
      
      // Clear authentication state and username from localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
      
      return true;
    } else {
      console.error('Logout failed:', data.error || response.statusText);
      throw new Error(data.error || 'Đăng xuất thất bại');
    }
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};

// Định nghĩa kiểu dữ liệu cho thiết bị (điều chỉnh cho phù hợp với cấu trúc thực tế của bạn)
export interface DeviceLog {
  timestamp: number;
  value: number;
  // Thêm các trường khác trong log nếu có (ví dụ: status cho button logs)
}

export interface Device {
  _id: string;
  name: string;
  channel: string;
  button_channel?: string;
  upper_threshold?: number;
  lower_threshold?: number;
  value?: number; // Giá trị khởi tạo ban đầu, nhưng giá trị động sẽ nằm trong logs
  logs: DeviceLog[];
  // Thêm các trường khác mà API của bạn trả về cho một thiết bị
  // ví dụ: type, create_epoch, expiration_epoch
}

// Hàm lấy tất cả các thiết bị
export const getAllDevicesApi = async (): Promise<Device[]> => {
  try {
    // Endpoint này dựa trên app.js: app.use('/device', deviceRoutes);
    // và giả sử deviceRoute.js có router.get('/', deviceController.getAllDevices);
    const response = await fetch(`${API_BASE_URL}/device`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi lấy danh sách thiết bị: ${errorData.message || response.statusText}`);
    }
    const devices: Device[] = await response.json();
    return devices;
  } catch (error) {
    console.error('Lỗi trong getAllDevicesApi:', error);
    throw error; // Ném lỗi để component có thể xử lý
  }
};

// Function to get a device by name
export const getDeviceByNameApi = async (name: string): Promise<Device> => {
  try {
    const response = await fetch(`${API_BASE_URL}/device/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi tìm thiết bị: ${errorData.message || response.statusText}`);
    }
    
    const device: Device = await response.json();
    return device;
  } catch (error) {
    console.error('Lỗi trong getDeviceByNameApi:', error);
    throw error;
  }
};

// Interface for button
export interface Button {
  _id: string;
  name: string;
  status: string;
  channel: string;
}

// Function to get all buttons
export const getAllButtonsApi = async (): Promise<Button[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/button`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi lấy danh sách buttons: ${errorData.message || response.statusText}`);
    }
    
    const buttons: Button[] = await response.json();
    return buttons;
  } catch (error) {
    console.error('Lỗi trong getAllButtonsApi:', error);
    throw error;
  }
};

// Function to get a button by name
export const getButtonByNameApi = async (button: string): Promise<Button> => {
  try {
    const response = await fetch(`${API_BASE_URL}/button/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ button }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi tìm button: ${errorData.message || response.statusText}`);
    }
    
    const buttonData: Button = await response.json();
    return buttonData;
  } catch (error) {
    console.error('Lỗi trong getButtonByNameApi:', error);
    throw error;
  }
};

// Function to control a button via MQTT
export const controlButtonViaMqttApi = async (buttonId: string, status: 'on' | 'off' | 'On' | 'Off'): Promise<{ message: string }> => {
  try {
    // Convert status to the format expected by the backend (capitalized)
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    console.log(`Sending MQTT command for button ${buttonId}: ${formattedStatus}`);
    
    const url = `${API_BASE_URL}/mqtt/${buttonId}`;
    console.log(`API URL: ${url}`);
    
    const requestBody = { status: formattedStatus };
    console.log(`Request body:`, requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Error response data:`, errorData);
      throw new Error(`Lỗi khi điều khiển thiết bị qua MQTT: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`API response:`, result);
    return result;
  } catch (error) {
    console.error('Lỗi trong controlButtonViaMqttApi:', error);
    throw error;
  }
};

// Interface for schedule data
export interface Schedule {
  _id?: string;
  channel: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  days_of_week: string[];
}

// Function to create a schedule
export const createScheduleApi = async (scheduleData: Schedule): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi tạo lịch trình: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi trong createScheduleApi:', error);
    throw error;
  }
};

// Function to get schedules for a button
export const getSchedulesByButtonIdApi = async (buttonId: string): Promise<Schedule[]> => {
  try {
    console.log(`Fetching schedules for button ID: ${buttonId}`);
    const response = await fetch(`${API_BASE_URL}/schedule/${buttonId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi lấy lịch trình: ${errorData.message || response.statusText}`);
    }
    
    const schedules = await response.json();
    console.log("API response:", schedules);
    
    // Handle both array and single object responses
    if (Array.isArray(schedules)) {
      console.log(`Received ${schedules.length} schedules from API`);
      return schedules;
    } else if (schedules && typeof schedules === 'object') {
      console.log("Received a single schedule object, converting to array");
      return [schedules];
    } else {
      console.log("No schedules found or invalid response format");
      return [];
    }
  } catch (error) {
    console.error('Lỗi trong getSchedulesByButtonIdApi:', error);
    throw error;
  }
};

// Function to update a schedule
export const updateScheduleApi = async (scheduleId: string, scheduleData: Schedule): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi cập nhật lịch trình: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi trong updateScheduleApi:', error);
    throw error;
  }
};

// Function to delete a schedule
export const deleteScheduleApi = async (scheduleId: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi xóa lịch trình: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi trong deleteScheduleApi:', error);
    throw error;
  }
};

// Function to add a new device
export const addDeviceApi = async (deviceData: {
  channel: string;
  name: string;
  upper_threshold: number;
  lower_threshold: number;
  button_channel: string;
  endpoint_api: string;
  logs: DeviceLog[];
}): Promise<Device> => {
  try {
    const response = await fetch(`${API_BASE_URL}/device`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi thêm thiết bị: ${errorData.message || response.statusText}`);
    }
    
    const newDevice: Device = await response.json();
    return newDevice;
  } catch (error) {
    console.error('Lỗi trong addDeviceApi:', error);
    throw error;
  }
};

// Function to add a new button
export const addButtonApi = async (buttonData: {
  name: string;
  channel: string;
  logs: DeviceLog[];
}): Promise<Button> => {
  try {
    const response = await fetch(`${API_BASE_URL}/button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buttonData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi thêm nút bấm: ${errorData.message || response.statusText}`);
    }
    
    const newButton: Button = await response.json();
    return newButton;
  } catch (error) {
    console.error('Lỗi trong addButtonApi:', error);
    throw error;
  }
};

// Function to update a button's status in the database
export const updateButtonStatusApi = async (buttonName: string, status: 'on' | 'off'): Promise<Button> => {
  try {
    const response = await fetch(`${API_BASE_URL}/button`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ button: buttonName, status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi cập nhật trạng thái nút bấm: ${errorData.message || response.statusText}`);
    }
    
    const updatedButton: Button = await response.json();
    return updatedButton;
  } catch (error) {
    console.error('Lỗi trong updateButtonStatusApi:', error);
    throw error;
  }
};

// Interface for notification
export interface Notification {
  _id: string;
  title?: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Function to get all notifications
export const getAllNotificationsApi = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notification`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi lấy thông báo: ${errorData.message || response.statusText}`);
    }
    
    const notifications: Notification[] = await response.json();
    return notifications;
  } catch (error) {
    console.error('Lỗi trong getAllNotificationsApi:', error);
    throw error;
  }
};

// Function to get all unread notifications
export const getUnreadNotificationsApi = async (): Promise<Notification[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notification/unread`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi lấy thông báo chưa đọc: ${errorData.message || response.statusText}`);
    }
    
    const notifications: Notification[] = await response.json();
    return notifications;
  } catch (error) {
    console.error('Lỗi trong getUnreadNotificationsApi:', error);
    throw error;
  }
};

// Function to mark all unread notifications as read
export const markAllNotificationsAsReadApi = async (): Promise<{ message: string, modifiedCount: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notification`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi đánh dấu thông báo đã đọc: ${errorData.message || response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi trong markAllNotificationsAsReadApi:', error);
    throw error;
  }
};

// Function to update device thresholds
export const updateDeviceThresholdsApi = async (
  deviceId: string,
  thresholds: { upper_threshold?: number; lower_threshold?: number }
): Promise<Device> => {
  try {
    const response = await fetch(`${API_BASE_URL}/device/${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thresholds),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Lỗi khi cập nhật ngưỡng thiết bị: ${errorData.message || response.statusText}`);
    }
    
    const updatedDevice: Device = await response.json();
    return updatedDevice;
  } catch (error) {
    console.error('Lỗi trong updateDeviceThresholdsApi:', error);
    throw error;
  }
};