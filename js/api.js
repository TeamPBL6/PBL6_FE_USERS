
const API_BASE_URL = 'http://localhost:8080';

// Lấy danh sách người dùng từ API
function fetchUsers() {
    fetch(API_BASE_URL+'/api/users')
        .then(response => response.json())
        .then(data => {
            const userList = document.getElementById('userList');
            userList.innerHTML = ''; // Xóa nội dung cũ

            data.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} - ${user.email}`;
                userList.appendChild(li);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Gửi dữ liệu người dùng mới đến API
function createUser(event) {
    event.preventDefault(); // Ngăn form gửi đi mặc định

    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
    };

    fetch(API_BASE_URL+'/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('User created:', data);
        fetchUsers(); // Gọi lại hàm fetchUsers để cập nhật danh sách người dùng
    })
    .catch(error => console.error('Error:', error));
}

// Khi trang đã tải xong, thiết lập sự kiện và gọi hàm fetchUsers
window.onload = function() {
    document.getElementById('userForm').addEventListener('submit', createUser);
    fetchUsers(); // Tải danh sách người dùng khi trang mở ra
};
