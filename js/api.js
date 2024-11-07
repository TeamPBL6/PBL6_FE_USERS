
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

                <div class="music-info text-center mt-3">
                    <h5 class="music-title">${music.title}</h5>
                    <p class="music-composer text-muted">${music.composerFullName}</p>
                    <p class="music-price text-success">$${music.price}</p>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = musicHTML;
}


function getAudioUrl(filename) {
    return `http://localhost:8181/api/musics/download/${filename}.mp3`;
}

// Hàm khởi tạo audio player
function initializeAudioPlayer(musicId) {
    const playerContainer = document.getElementById(`player-${musicId}`);
    const audio = document.getElementById(`audio-${musicId}`);
    const playBtn = playerContainer.querySelector('.play-btn');
    const progressBar = playerContainer.querySelector('.progress-bar');
    const progress = playerContainer.querySelector('.progress');
    const currentTimeSpan = playerContainer.querySelector('.current-time');
    const durationSpan = playerContainer.querySelector('.duration');

    // Format time function
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Play/Pause toggle
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            // Pause all other playing audio first
            document.querySelectorAll('audio').forEach(a => {
                if (a !== audio && !a.paused) {
                    a.pause();
                    const otherBtn = a.parentElement.querySelector('.play-btn i');
                    otherBtn.classList.remove('fa-pause');
                    otherBtn.classList.add('fa-play');
                }
            });
            
            audio.play();
            playBtn.querySelector('i').classList.remove('fa-play');
            playBtn.querySelector('i').classList.add('fa-pause');
        } else {
            audio.pause();
            playBtn.querySelector('i').classList.remove('fa-pause');
            playBtn.querySelector('i').classList.add('fa-play');
        }
    });

    // Update progress bar
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    });

    // Click on progress bar to seek
    progress.addEventListener('click', (e) => {
        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percent * audio.duration;
    });

    // Update duration display when metadata is loaded
    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
    });

    // Reset when audio ends
    audio.addEventListener('ended', () => {
        progressBar.style.width = '0%';
        playBtn.querySelector('i').classList.remove('fa-pause');
        playBtn.querySelector('i').classList.add('fa-play');
        currentTimeSpan.textContent = '0:00';
    });

    // Error handling
    audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        alert('Error loading audio. Please try again later.');
    });
}

// Hàm tạo modals
function generateModals(musics) {
    if (!Array.isArray(musics)) {
        console.error('Invalid musics data:', musics);
        return;
    }

    const modalContainer = document.querySelector('.modal-container');
    const modalsHTML = musics.map(music => {
        let filename = '';
        if (music.demo_url) {
            filename = music.demo_url.split('\\').pop().replace('.mp3', '');
        } else if (music.demoUrl) {
            filename = music.demoUrl.split('\\').pop().replace('.mp3', '');
        } else {
            console.warn(`No demo URL found for music ID: ${music.id}`);
            filename = music.id.toString();
        }

        return `
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
                                    <img class="img-fluid rounded mb-5" src="${'/assets/img/portfolio/cabin.png'}" alt="${music.title || 'Music'}" />
                                    
                                    <!-- Custom Audio Player -->
                                    <div class="custom-audio-player mb-4" id="player-${music.id}">
                                        <audio id="audio-${music.id}">
                                            <source src="${getAudioUrl(filename)}" type="audio/mpeg">
                                        </audio>
                                        
                                        <div class="progress mb-2" style="height: 6px; cursor: pointer;">
                                            <div class="progress-bar bg-primary" role="progressbar" style="width: 0%"></div>
                                        </div>
                                        
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="current-time">0:00</span>
                                            <div class="controls">
                                                <button class="btn btn-link play-btn">
                                                    <i class="fas fa-play"></i>
                                                </button>
                                            </div>
                                            <span class="duration">0:00</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6 text-start">
                                    <h2 class="mb-3">${music.title || 'Untitled'}</h2>
                                    <p class="text-muted mb-2">${music.composerFullName || music.composer || 'Unknown Artist'}</p>
                                    
                                    <div class="d-flex align-items-center gap-3 mb-4">
                                        <button class="btn btn-outline-secondary btn-circle">
                                            <i class="far fa-heart"></i>
                                        </button>
                                        <button class="btn btn-outline-secondary btn-circle">
                                            <i class="fas fa-share"></i>
                                        </button>
                                    </div>

                                    <div class="song-details mt-4">
                                        <div class="row mb-2">
                                            <div class="col-3">Category:</div>
                                            <div class="col-9">${music.categoryName || music.category || 'Uncategorized'}</div>
                                        </div>
                                        <div class="row mb-2">
                                            <div class="col-3">Price:</div>
                                            <div class="col-9">${music.price || 0} VND</div>
                                        </div>
                                    </div>

                                    <button class="btn btn-primary" onclick="showPurchaseModal(${music.id})">
                                        <i class="fas fa-shopping-cart"></i> Mua
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    modalContainer.innerHTML = modalsHTML;

    // Initialize audio players
    musics.forEach(music => {
        initializeAudioPlayer(music.id);
    });
}


// Hàm show purchase modal (cần được định nghĩa)
function showPurchaseModal(musicId) {
    // Implement your purchase modal logic here
    console.log('Show purchase modal for music ID:', musicId);
}

// Test data

function showPurchaseModal(musicId) {
    currentMusicId = musicId; // Lưu ID bài hát hiện tại

    // Ẩn tất cả các modal hiện tại trước khi hiện modal xác nhận
    const portfolioModals = document.querySelectorAll('.portfolio-modal');
    portfolioModals.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide(); // Ẩn modal nếu nó đang mở
        }
    });

    const purchaseModal = new bootstrap.Modal(document.getElementById('purchaseModal'));
    purchaseModal.show();
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
    const token = localStorage.getItem('token');
    if (!token) {
    
        // Lưu lại trang hiện tại để sau khi đăng nhập có thể quay lại
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        // Chuyển hướng đến trang đăng nhập
        window.location.href = '/login.html';
        return;
    }
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
        window.location.href = '/index.html';
        const downloadUrl = `http://localhost:8181/api/musics/download/${music.title}.mp3`; // Hoặc sử dụng filename
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl; // Sử dụng URL tải xuống từ API
        downloadLink.download = music.title; // Đặt tên file khi tải xuống
        downloadLink.click(); // Tự động click để tải file
        
        // Cập nhật số dư ví hiển thị
        document.getElementById('walletBalance').textContent = `${result.newBalance} VND`;
    } catch (error) {
        console.error('There was a problem with the purchase:', error);
        alert('Transaction failed. Please try again later.');
    }
}

document.getElementById('confirmPurchaseButton').addEventListener('click', async () => {
    if (currentMusicId) {
        await purchaseMusic(currentMusicId); // Gọi hàm mua nhạc
        const purchaseModal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
        purchaseModal.hide(); // Đóng modal sau khi mua thành công
    }
});
document.getElementById('cancelButton').addEventListener('click', function() {
    const purchaseModal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
    purchaseModal.hide(); // Ẩn modal xác nhận

    // Hiện lại modal chi tiết nhạc (thay "musicId" bằng ID bài hát hiện tại)
    const portfolioModal = new bootstrap.Modal(document.getElementById(`portfolioModal${currentMusicId}`));
    portfolioModal.show(); // Hiện modal chi tiết nhạc
});

