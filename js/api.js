
const API_BASE_URL = 'http://localhost:8181';

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
document.addEventListener('DOMContentLoaded', function() {
    fetchMusics();
});

async function fetchMusics() {
    try {
        const response = await fetch(API_BASE_URL+'/api/musics?page=1&pageSize=10');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        if (result.status === 200 && result.data && result.data.items) {
            displayMusics(result.data.items);
            generateModals(result.data.items);
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('portfolio-container').innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error loading music data: ${error.message}</p>
                <button class="btn btn-primary mt-3" onclick="fetchMusics()">Try Again</button>
            </div>
        `;
    }
}

async function fetchMusicDetails(id) {
    try {
        const response = await fetch(API_BASE_URL+`/api/musics/${id}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        if (result.status === 200 && result.data) {
            updateModal(result.data);
        }
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

function displayMusics(musics) {
    const container = document.getElementById('portfolio-container');
    
    if (!Array.isArray(musics) || musics.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No music data available</p></div>';
        return;
    }

    const musicHTML = musics.map(music => `
        <div class="col-md-6 col-lg-4 mb-5">
            <div class="portfolio-item mx-auto" onclick="fetchMusicDetails(${music.id})" data-bs-toggle="modal" data-bs-target="#portfolioModal${music.id}" style="position: relative; height: 100%;">
                <img class="img-fluid" src="/assets/img/portfolio/cabin.png" alt="${music.title}" style="width: 100%; height: auto; object-fit: cover;"/>
                
                <div class="portfolio-item-caption d-flex align-items-center justify-content-center h-100 w-100" style="position: absolute; top: 0; left: 0;">
                    <div class="portfolio-item-caption-content text-center text-white">
                        <i class="fas fa-shopping-cart fa-3x"></i> <!-- Biểu tượng giỏ hàng -->
                    </div>
                </div>
            </div>
        </div>
    `).join('');


    
    container.innerHTML = musicHTML;
}

function generateModals(musics) {
    const modalContainer = document.querySelector('.modal-container');
    const modalsHTML = musics.map(music => `
        <div class="portfolio-modal modal fade" id="portfolioModal${music.id}" tabindex="-1" aria-labelledby="portfolioModal${music.id}" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header border-0">
                        <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body pb-5">
                        <div class="container">
                            <div class="row">
                                <div class="col-lg-6">
                                    <img class="img-fluid rounded mb-5" src="/assets/img/portfolio/cabin.png" alt="${music.title}" />
                                </div>
                                <div class="col-lg-6 text-start">
                                    <h2 class="mb-3">${music.title}</h2>
                                    <p class="text-muted mb-2">${music.composerFullName}</p>
                                    
                                    <div class="d-flex align-items-center gap-3 mb-4">
                                       
                                        <button class="btn btn-outline-secondary btn-circle">
                                            <i class="far fa-heart"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary btn-circle">
                                            <i class="fas fa-share"></i>
                                        </button>
                                    </div>

                                    <audio id="audio-${music.id}" class="audio-player" controls>
                                        <source src="${music.demoUrl}" type="audio/mpeg">
                                        Your browser does not support the audio element.
                                    </audio>

                                    <div class="song-details mt-4">
                                        <div class="row mb-2">
                                            <div class="col-3">Category:</div>
                                            <div class="col-9">${music.categoryName}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-3">Price:</div>
                                            <div class="col-9">$${music.price}</div>
                                        </div>
                                    </div>

                                   <button class="btn btn-primary" onclick="purchaseMusic(${music.id})">Buy Now with VNPay</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    modalContainer.innerHTML = modalsHTML;
}

function updateModal(musicDetail) {
    // Update modal content with detailed information if needed
    const modal = document.querySelector(`#portfolioModal${musicDetail.id}`);
    if (modal) {
        // Update any additional details here
    }
}

function togglePlay(url, button) {
    const audio = document.querySelector(`audio[src="${url}"]`);
    if (audio) {
        if (audio.paused) {
            audio.play();
            button.innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
        } else {
            audio.pause();
            button.innerHTML = '<i class="fas fa-play me-2"></i>Play Demo';
        }
    } else {
        console.error('Audio element not found for URL:', url);
    }
}
async function purchaseMusic(musicId) {
    try {
        const response = await fetch(API_BASE_URL+'/api/payment/create-vnpay-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ musicId: musicId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.paymentUrl) {
            // Chuyển hướng đến URL thanh toán
            window.location.href = result.paymentUrl.replace(/\"/g, ''); // Xóa dấu ngoặc kép nếu có
        } else {
            throw new Error('Invalid payment URL');
        }
    } catch (error) {
        console.error('Error creating payment:', error);
        alert('An error occurred while processing your payment. Please try again.');
    }}
