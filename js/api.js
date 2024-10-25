
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
let musics = [];
async function fetchMusics() {
    try {
        const response = await fetch(API_BASE_URL + '/api/musics?page=1&pageSize=10');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        
        console.log('API response:', result); // Log phản hồi API

        if (result.status === 200 && result.data && result.data.items) {
            musics = result.data.items; // Gán giá trị cho biến musics
            console.log('Fetched musics:', musics); // Log dữ liệu được fetch
            displayMusics(musics);
            generateModals(musics);
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

                                 <button class="btn btn-primary" onclick="purchaseMusic(${music.id})">
    <i class="fas fa-shopping-cart"></i> Mua
</button>

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
    console.log('Attempting to purchase music with ID:', musicId);
    const userId = localStorage.getItem('userId'); // Lấy ID người mua từ localStorage
    const walletId = localStorage.getItem('walletId'); // Lấy walletId người mua từ localStorage
    const music = musics.find(m => m.id === musicId); // Tìm bài nhạc theo ID
    console.log('userId:', userId); // Log giá trị userId
    console.log('walletId:', walletId); // Log giá trị walletId
    console.log('music:', music);
    console.log('All musics:', musics); 
    
    if (!userId || !walletId || !music) {
        alert('User or wallet information is missing. Please log in.');
        console.error('User or wallet information is missing.');
        return;
    }

    // Thông tin giao dịch
    const purchaseData = {
        userId: Number(userId),
        composerId: music.composerId, // Giả sử mỗi đối tượng nhạc có composerId
        price: music.price,
        musicId: musicId
    };
    console.log('Purchase Data:', JSON.stringify(purchaseData));

    try {
        const response = await fetch('http://localhost:8181/api/wallet/purchaseMusic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Nếu cần
            },
            body: JSON.stringify(purchaseData)
        });

        if (!response.ok) {
            throw new Error('Transaction failed.');
        }

        const result = await response.json();
        alert(`Purchase successful! Remaining balance: $${result.newBalance}`);
        window.location.href = '/index.html';
        // Cập nhật số dư ví hiển thị
        document.getElementById('walletBalance').textContent = `${result.newBalance}$`;
    } catch (error) {
        console.error('There was a problem with the purchase:', error);
        alert('Transaction failed. Please try again later.');
    }
}

