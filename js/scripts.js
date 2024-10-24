

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
document.getElementById('createMusicBtn').addEventListener('click', function() {
    var midiFile = document.getElementById('midiFile').files[0];
    if (midiFile) {
        // Here you would add the logic to handle the MIDI file
        console.log('MIDI file uploaded:', midiFile.name);
        // Add your music creation logic here
    } else {
        alert('Please select a MIDI file first.');
    }
});
fetch('Header.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    });

// Hàm để tải footer
fetch('Footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer').innerHTML = data;
    });
 async function handleCreateMusic() {
        const midiFile = document.getElementById('midiFile').files[0];
        if (!midiFile) {
            alert('Please select a MIDI file');
            return;
        }
    
        try {
            // Show loading state
            const createBtn = document.getElementById('createMusicBtn');
            createBtn.disabled = true;
            createBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    
            // Create FormData
            const formData = new FormData();
            formData.append('midiFile', midiFile);
    
            // Send to server
            const response = await fetch('/api/create-music', {
                method: 'POST',
                body: formData
            });
    
            const data = await response.json();
    
            if (data.success) {
                // Hide create modal
                const createModal = bootstrap.Modal.getInstance(document.getElementById('createMusicModal'));
                createModal.hide();
    
                // Update success modal with song data
                document.getElementById('successSongTitle').textContent = data.songTitle;
                document.getElementById('successAlbumName').textContent = `Album: ${data.albumName}`;
                document.getElementById('successDuration').textContent = `Thời lượng: ${data.duration}`;
                document.getElementById('previewAudio').src = data.previewUrl;
    
                // Show success modal
                showUploadSuccess();
            } else {
                alert('Failed to create music: ' + data.message);
            }
        } catch (error) {
            alert('Error creating music: ' + error.message);
        } finally {
            // Reset button state
            const createBtn = document.getElementById('createMusicBtn');
            createBtn.disabled = false;
            createBtn.innerHTML = 'Create Music';
        }
    }
    
    // Download song
    function downloadSong() {
        const downloadUrl = 'path_to_full_song.mp3';
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'song_name.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // View song details
    function viewSongDetails() {
        window.location.href = '/song-details/123';
    }
    
    // Show success modal
    function showUploadSuccess() {
        const modal = new bootstrap.Modal(document.getElementById('uploadSuccessModal'));
        modal.show();
    }
    
// Hàm test modal thành công
// function testSuccessModal() {
//     // Mô phỏng dữ liệu từ server
//     const mockData = {
//         success: true,
//         songTitle: "Beautiful Melody",
//         albumName: "Summer Vibes 2024",
//         duration: "3:45",
//         previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // URL thử nghiệm
//     };

//     // Cập nhật thông tin trong modal
//     document.getElementById('successSongTitle').textContent = mockData.songTitle;
//     document.getElementById('successAlbumName').textContent = `Album: ${mockData.albumName}`;
//     document.getElementById('successDuration').textContent = `Thời lượng: ${mockData.duration}`;
    
//     // Cập nhật source cho audio preview
//     const audioElement = document.getElementById('previewAudio');
//     audioElement.src = mockData.previewUrl;

//     // Hiển thị modal
//     const successModal = new bootstrap.Modal(document.getElementById('uploadSuccessModal'));
//     successModal.show();
// }
