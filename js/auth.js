function checkAuthentication() {
    const token = localStorage.getItem('token');  // Lấy token từ localStorage

    if (!token) {
        // Nếu không có token, chuyển hướng đến trang đăng nhập
        window.location.href = '/login.html';
    }
}
