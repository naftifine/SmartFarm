// frontend-react/src/service/LoginTest.tsx

import React, { useState, useEffect } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom'; // Để chuyển hướng
import { signupUser, loginUser } from '../apiService'; // Import các hàm API

export const LoginTest = () => {
    // --- State để quản lý giá trị input cho cả hai form ---
    const [signInUsername, setSignInUsername] = useState('');
    const [signInPassword, setSignInPassword] = useState('');
    const [signUpUsername, setSignUpUsername] = useState('');
    const [signUpEmail, setSignUpEmail] = useState(''); // API backend chỉ dùng username/password cho signup, nhưng form của bạn có cả email
    const [signUpPassword, setSignUpPassword] = useState('');
    const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

    // --- State để quản lý lỗi ---
    const [signInError, setSignInError] = useState('');
    const [signUpError, setSignUpError] = useState('');

    const navigate = useNavigate(); // Hook để chuyển hướng

    // --- Logic ẩn/hiện form hiện tại (giữ nguyên cách bạn làm) ---
     useEffect(() => {
         const signInTab = document.getElementById("signInTab");
         const signUpTab = document.getElementById("signUpTab");
         const signInForm = document.getElementById("signInForm");
         const signUpForm = document.getElementById("signUpForm");

         const handleSignInClick = () => {
             signInForm?.classList.remove("hidden");
             signUpForm?.classList.add("hidden");
             signInTab?.classList.add("text-indigo-600", "border-indigo-500");
             signUpTab?.classList.remove("text-indigo-600", "border-indigo-500");
              setSignUpError(''); // Xóa lỗi form đăng ký khi chuyển tab
         };

         const handleSignUpClick = () => {
             signUpForm?.classList.remove("hidden");
             signInForm?.classList.add("hidden");
             signUpTab?.classList.add("text-indigo-600", "border-indigo-500");
             signInTab?.classList.remove("text-indigo-600", "border-indigo-500");
              setSignInError(''); // Xóa lỗi form đăng nhập khi chuyển tab
         };

         // Khởi tạo trạng thái ban đầu (ví dụ: form Sign In hiển thị mặc định)
         handleSignInClick(); // Gọi hàm này một lần khi component mount

         signInTab?.addEventListener("click", handleSignInClick);
         signUpTab?.addEventListener("click", handleSignUpClick);

         return () => {
             signInTab?.removeEventListener("click", handleSignInClick);
             signUpTab?.removeEventListener("click", handleSignUpClick);
         };
     }, []); // Dependency rỗng đảm bảo chỉ chạy một lần khi mount

    // --- Hàm xử lý submit form Đăng nhập ---
    const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Ngăn chặn tải lại trang
        setSignInError(''); // Xóa lỗi cũ

        try {
            // GỌI API ĐĂNG NHẬP
            const success = await loginUser(signInUsername, signInPassword);

            if (success) {
                console.log('Đăng nhập thành công!');
                // Xử lý sau khi đăng nhập thành công: lưu token (nếu có), chuyển hướng
                // Note: The authentication state is now stored in localStorage by the loginUser function
                navigate('/home'); // Chuyển hướng đến trang chủ
            }
            // Nếu loginUser ném lỗi, nó sẽ được bắt bởi khối catch
        } catch (err: Error | unknown) {
            console.error('Lỗi đăng nhập:', err);
            // Hiển thị thông báo lỗi từ backend hoặc lỗi chung
            const errorMessage = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.';
            setSignInError(errorMessage);
        }
    };

    // --- Hàm xử lý submit form Đăng ký ---
    const handleSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Ngăn chặn tải lại trang
        setSignUpError(''); // Xóa lỗi cũ

        // Kiểm tra mật khẩu xác nhận
        if (signUpPassword !== signUpConfirmPassword) {
            setSignUpError('Mật khẩu xác nhận không khớp.');
            return; // Ngừng xử lý nếu mật khẩu không khớp
        }

        // Lưu ý: Backend API signup chỉ nhận username và password.
        // Form của bạn có trường Email. Bạn cần quyết định có gửi trường Email này lên không
        // hoặc chỉ sử dụng username và password theo đúng API backend hiện tại.
        // Dưới đây là code gọi API chỉ với username và password theo đúng API doc.
        // Nếu bạn cần gửi cả email, bạn cần điều chỉnh API backend.

        try {
            // GỌI API ĐĂNG KÝ
            // Sử dụng signUpUsername và signUpPassword từ state
            const success = await signupUser(signUpUsername, signUpPassword);

            if (success) {
                console.log('Đăng ký thành công!');
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                // Có thể chuyển người dùng sang tab Đăng nhập
                 const signInTab = document.getElementById("signInTab");
                 signInTab?.click(); // Kích hoạt click để chuyển tab
                // Hoặc xóa các trường form đăng ký:
                setSignUpUsername('');
                setSignUpEmail('');
                setSignUpPassword('');
                setSignUpConfirmPassword('');
            }
            // Nếu signupUser ném lỗi, nó sẽ được bắt bởi khối catch
        } catch (err: Error | unknown) {
            console.error('Lỗi đăng ký:', err);
            // Hiển thị thông báo lỗi từ backend (ví dụ: 'Username already exists') hoặc lỗi chung
            const errorMessage = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.';
            setSignUpError(errorMessage);
        }
    };


    return (
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 md:p-8 transition-all duration-300">
            {/* Các nút chuyển tab giữ nguyên */}
            <div className="flex justify-between mb-6 border-b border-gray-200">
                <button id="signInTab" className="w-1/2 text-center text-gray-600 pb-2 font-medium border-b-2 border-transparent hover:border-indigo-500 focus:outline-none transition">Sign In</button>
                <button id="signUpTab" className="w-1/2 text-center text-gray-600 pb-2 font-medium border-b-2 border-transparent hover:border-indigo-500 focus:outline-none transition">Sign Up</button>
            </div>

            {/* Form Đăng nhập - Thêm onSubmit và kết nối input với state */}
            <form id="signInForm" className="space-y-4" onSubmit={handleSignInSubmit}>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Username</label>{/* Thay Email thành Username theo API */}
                    <input
                        type="text" // Thay email thành text theo API backend
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="username" // Cập nhật placeholder
                        value={signInUsername} // Kết nối với state
                        onChange={(e) => setSignInUsername(e.target.value)} // Cập nhật state khi gõ
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••••"
                        value={signInPassword} // Kết nối với state
                        onChange={(e) => setSignInPassword(e.target.value)} // Cập nhật state khi gõ
                        required
                    />
                </div>
                {/* ... Các phần Remember me, Forgot password giữ nguyên ... */}
                 <div className="flex justify-between text-sm text-gray-600">
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                        <span>Remember me</span>
                    </label>
                    <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
                </div>

                {/* Hiển thị lỗi đăng nhập */}
                {signInError && <div className="text-red-500 text-sm">{signInError}</div>}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition">Sign In</button>
            </form>

            {/* Form Đăng ký - Thêm onSubmit và kết nối input với state */}
            <form id="signUpForm" className="space-y-4 hidden" onSubmit={handleSignUpSubmit}>
                 <div>
                    <label className="block text-gray-700 font-medium mb-1">Username</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="username"
                        value={signUpUsername} // Kết nối với state
                        onChange={(e) => setSignUpUsername(e.target.value)} // Cập nhật state khi gõ
                        required
                     />
                 </div>
                 <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>{/* Giữ nguyên nếu bạn muốn có trường này trên form */}
                    <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="example@gmail.com"
                        value={signUpEmail} // Kết nối với state
                        onChange={(e) => setSignUpEmail(e.target.value)} // Cập nhật state khi gõ
                        // required // Tùy chọn, nếu backend không dùng thì không bắt buộc ở đây
                     />
                 </div>
                 <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••••"
                        value={signUpPassword} // Kết nối với state
                        onChange={(e) => setSignUpPassword(e.target.value)} // Cập nhật state khi gõ
                        required
                     />
                 </div>
                 <div>
                    <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••••"
                        value={signUpConfirmPassword} // Kết nối với state
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)} // Cập nhật state khi gõ
                        required
                     />
                 </div>

                {/* Hiển thị lỗi đăng ký */}
                {signUpError && <div className="text-red-500 text-sm">{signUpError}</div>}

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition">Sign Up</button>
            </form>

            {/* Các phần khác giữ nguyên */}
        </div>
    );
};

// Đảm bảo bạn đã tạo file apiService.ts (hoặc .js) như hướng dẫn trước
// và các hàm loginUser, signupUser đã được export từ đó.