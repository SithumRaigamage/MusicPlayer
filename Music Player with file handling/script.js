
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('popupFileInput');
    const songList = document.getElementById('songList');
    const prevBtn = document.getElementById('prev-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress');
    const albumCover = document.getElementById('albumCover');
    const songTitle = document.getElementById('songTitle');
    const menuBar = document.getElementById('menu-bar');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');

    let audio = new Audio();
    let currentSongIndex = 0;
    let songs = [];

    function handleFileUpload(event) {
        const files = event.target.files;
        for (let file of files) {
            const url = URL.createObjectURL(file);
            if (!songs.some(song => song.url === url)) {
                const li = document.createElement('li');
                li.textContent = file.name;
                li.setAttribute('data-url', url);
                li.addEventListener('click', () => {
                    currentSongIndex = songs.findIndex(song => song.url === url);
                    playSong(currentSongIndex);
                });
                songList.appendChild(li);
                songs.push({ file: file, name: file.name, url: url });
            }
        }
        if (songs.length > 0) {
            playSong(currentSongIndex);
        } else {
            displayDefaultImage();
        }
    }

    function playSong(index) {
        if (songs.length === 0) return;
        const song = songs[index];
        audio.src = song.url;
        audio.play();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        albumCover.classList.add('rotating');

        jsmediatags.read(song.file, {
            onSuccess: function(tag) {
                const tags = tag.tags;
                if (tags.picture) {
                    // Code for album cover image handling
                    const data = tags.picture.data;
                    const format = tags.picture.format;
                    let base64String = "";
                    for (let i = 0; i < data.length; i++) {
                        base64String += String.fromCharCode(data[i]);
                    }
                    albumCover.src = `data:${format};base64,${window.btoa(base64String)}`;
                } else {
                    albumCover.src = 'images/empty.png';
                }
                // Here, the title tag of the metadata is checked and used if available
                songTitle.textContent = tags.title || song.name;
            },
            onError: function(error) {
                console.log(error);
                albumCover.src = 'images/empty.png';
                // In case of an error, fallback to using the file name as the title
                songTitle.textContent = song.name;
            }
        });
    }

    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            albumCover.classList.add('rotating');
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            albumCover.classList.remove('rotating');
        }
    }

    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    }

    function playPrevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    }

    function updateProgressBar() {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
    }

    function displayDefaultImage() {
        albumCover.src = 'images/empty.png';
        songTitle.textContent = 'No song playing';
        albumCover.classList.remove('rotating');
    }

    audio.addEventListener('timeupdate', updateProgressBar);
    audio.addEventListener('ended', playNextSong);
    fileInput.addEventListener('change', handleFileUpload);
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNextSong);
    prevBtn.addEventListener('click', playPrevSong);

    menuBar.addEventListener('click', () => {
        popup.style.display = 'block';
    });

    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == popup) {
            popup.style.display = 'none';
        }
    });
});
