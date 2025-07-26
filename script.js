const songs = [
    {
        title: "Shape Of You",
        artist: "Ed Sheeran",
        genre: "Pop",
        image: "https://i.imgur.com/yNqP7Zg.jpg",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
        title: "All Of Me",
        artist: "Adele",
        genre: "Pop",
        image: "https://i.imgur.com/w1GJtEh.jpg",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
        title: "Locked Away",
        artist: "R. City",
        genre: "Rock",
        image: "https://i.imgur.com/yNqP7Zg.jpg",
        audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
];

const songList = document.getElementById("songList");
const genreFilter = document.getElementById("genreFilter");
const audioPlayer = document.getElementById("audioPlayer");
const songTitle = document.getElementById("songTitle");
const songArtist = document.getElementById("songArtist");
const songImage = document.getElementById("songImage");
const darkToggle = document.getElementById("darkModeToggle");

const playlistInput = document.getElementById("playlistInput");
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const allPlaylists = document.getElementById("allPlaylists");
const currentPlaylist = document.getElementById("currentPlaylist");
const addToPlaylistBtn = document.getElementById("addToPlaylistBtn");

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let playlists = {};
let selectedPlaylist = null;
let currentSong = null;
let currentSongIndex = 0;

function renderSongs(genre = "All") {
    songList.innerHTML = "";
    songs
        .filter((song) => genre === "All" || song.genre === genre)
        .forEach((song, index) => {
            const btn = document.createElement("button");
            btn.textContent = `${song.title} - ${song.artist}`;
            btn.addEventListener("click", () => {
                currentSongIndex = index;
                playSong(song);
            });
            songList.appendChild(btn);
        });
}

function playSong(song) {
    currentSong = song;
    audioPlayer.src = song.audio;
    audioPlayer.play();
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    songImage.src = song.image;
}

createPlaylistBtn.addEventListener("click", () => {
    const playlistName = playlistInput.value.trim();
    if (playlistName && !playlists[playlistName]) {
        playlists[playlistName] = [];
        selectedPlaylist = playlistName;
        savePlaylists();
        renderPlaylists();
        renderCurrentPlaylist();
    }
    playlistInput.value = "";
});

addToPlaylistBtn.addEventListener("click", () => {
    if (selectedPlaylist && currentSong) {
        playlists[selectedPlaylist].push(currentSong);
        savePlaylists();
        renderCurrentPlaylist();
    }
});

function renderPlaylists() {
    allPlaylists.innerHTML = '';

    Object.keys(playlists).forEach((name) => {
        const playlistContainer = document.createElement('div');
        playlistContainer.classList.add('playlist-wrapper');

        // Playlist select button
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.classList.add('playlist-button');
        if (name === selectedPlaylist) btn.classList.add('active');

        btn.addEventListener('click', () => {
            selectedPlaylist = name;
            renderPlaylists();
            renderCurrentPlaylist();
        });

        // ❌ Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.classList.add('remove-playlist-button');
        removeBtn.addEventListener('click', () => {
            if (confirm(`Delete playlist "${name}"?`)) {
                delete playlists[name];
                if (selectedPlaylist === name) selectedPlaylist = null;
                savePlaylists();
                renderPlaylists();
                renderCurrentPlaylist();
            }
        });

        playlistContainer.appendChild(btn);
        playlistContainer.appendChild(removeBtn);
        allPlaylists.appendChild(playlistContainer);
    });
}





searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';

    if (!query) return;

    // 1. Filter songs
    const matchedSongs = songs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    // 2. Filter playlists
    const matchedPlaylists = Object.keys(playlists).filter(name =>
        name.toLowerCase().includes(query)
    );

    // Display matched songs
    matchedSongs.forEach(song => {
        const songBtn = document.createElement('button');
        songBtn.textContent = `🎵 ${song.title} - ${song.artist}`;
        songBtn.classList.add('playlist-song');
        songBtn.addEventListener('click', () => {
            playSong(song);
            searchResults.innerHTML = '';
            searchInput.value = '';
        });
        searchResults.appendChild(songBtn);
    });

    // Display matched playlists
    matchedPlaylists.forEach(name => {
        const playlistBtn = document.createElement('button');
        playlistBtn.textContent = `📁 ${name}`;
        playlistBtn.classList.add('playlist-button');
        playlistBtn.addEventListener('click', () => {
            selectedPlaylist = name;
            renderPlaylists();
            renderCurrentPlaylist();
            searchResults.innerHTML = '';
            searchInput.value = '';
        });
        searchResults.appendChild(playlistBtn);
    });
});

function renderCurrentPlaylist() {
    currentPlaylist.innerHTML = '';

    if (!selectedPlaylist) {
        currentPlaylist.textContent = 'No playlist selected';
        return;
    }

    const playlistSongs = playlists[selectedPlaylist];

    if (!Array.isArray(playlistSongs) || playlistSongs.length === 0) {
        currentPlaylist.textContent = 'No songs in this playlist.';
        return;
    }

    playlistSongs.forEach((song, index) => {
        if (!song || typeof song !== 'object' || !song.title || !song.audio) {
            console.warn('Invalid song in playlist:', song);
            return;
        }

        // Create a wrapper div for song + remove button
        const songItem = document.createElement('div');
        songItem.classList.add('playlist-song-item');

        // Song play button
        const songBtn = document.createElement('button');
        songBtn.textContent = `${song.title} - ${song.artist}`;
        songBtn.classList.add('playlist-song');
        songBtn.addEventListener('click', () => {
            playSong(song);
        });

        // ❌ Remove button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '❌';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', () => {
            // Remove from playlist
            playlists[selectedPlaylist].splice(index, 1);
            savePlaylists();
            renderCurrentPlaylist();
        });

        // Append both to the wrapper
        songItem.appendChild(songBtn);
        songItem.appendChild(removeBtn);

        // Add to current playlist section
        currentPlaylist.appendChild(songItem);
    });

}


function savePlaylists() {
    localStorage.setItem("musicAppPlaylists", JSON.stringify(playlists));
}

function loadPlaylists() {
    const stored = localStorage.getItem("musicAppPlaylists");
    if (stored) {
        try {
            playlists = JSON.parse(stored);
            const first = Object.keys(playlists)[0];
            if (first) selectedPlaylist = first;
        } catch (e) {
            console.error("Failed to parse playlists from localStorage", e);
            playlists = {};
        }
        renderPlaylists();
        renderCurrentPlaylist();
    }
}

function loadSong(index) {
    const song = songs[index];
    playSong(song);
}

document.getElementById("nextSongBtn").addEventListener("click", () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
});

document.getElementById("prevSongBtn").addEventListener("click", () => {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
});

genreFilter.addEventListener("change", (e) => {
    renderSongs(e.target.value);
});

darkToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark");
});

loadPlaylists();
renderSongs();
