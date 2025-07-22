import * as THREE from 'three';
class BTSWebsite {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.floatingShapes = [];
        this.audioPlayer = null;
        this.currentSongIndex = 0;
        this.songs = [];
        this.isPlaying = false;
        this.init();
    }
    init() {
        this.initThreeJS();
        this.initMusicPlayer();
        this.initHTMXHandlers();
        this.initScrollEffects();
        this.animate();
    }
    initThreeJS() {
        const container = document.getElementById('three-container');
        if (!container)
            return;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);
        this.createParticles();
        this.createFloatingShapes();
        this.camera.position.z = 5;
        window.addEventListener('resize', () => this.onWindowResize());
    }
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.7, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        this.particles = new THREE.Points(geometry, material);
        this.scene?.add(this.particles);
    }
    createFloatingShapes() {
        const shapes = [];
        const geometries = [
            new THREE.BoxGeometry(0.2, 0.2, 0.2),
            new THREE.SphereGeometry(0.1, 8, 6),
            new THREE.ConeGeometry(0.1, 0.3, 6)
        ];
        for (let i = 0; i < 20; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.7, 0.8, 0.6),
                transparent: true,
                opacity: 0.3,
                wireframe: true
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            this.floatingShapes.push(mesh);
            this.scene?.add(mesh);
        }
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.001;
        if (this.particles) {
            this.particles.rotation.y = time * 0.1;
            this.particles.rotation.x = time * 0.05;
        }
        if (this.floatingShapes) {
            this.floatingShapes.forEach(shape => {
                shape.rotation.x += shape.userData.rotationSpeed.x;
                shape.rotation.y += shape.userData.rotationSpeed.y;
                shape.rotation.z += shape.userData.rotationSpeed.z;
                shape.position.y += Math.sin(time + shape.position.x) * 0.001;
            });
        }
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    initMusicPlayer() {
        this.audioPlayer = document.getElementById('audio-player');
        if (!this.audioPlayer)
            return;
        const playBtn = document.getElementById('play-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const progressBar = document.querySelector('.progress');
        const currentTimeEl = document.getElementById('current-time');
        const durationEl = document.getElementById('duration');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.togglePlay());
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSong());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSong());
        }
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('timeupdate', () => {
                this.updateProgress();
            });
            this.audioPlayer.addEventListener('loadedmetadata', () => {
                this.updateDuration();
            });
            this.audioPlayer.addEventListener('ended', () => {
                this.nextSong();
            });
        }
        const progressContainer = document.querySelector('.progress-bar');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => {
                this.seekTo(e);
            });
        }
    }
    togglePlay() {
        if (!this.audioPlayer)
            return;
        const playBtn = document.getElementById('play-btn');
        if (this.isPlaying) {
            this.audioPlayer.pause();
            if (playBtn)
                playBtn.textContent = '▶';
            this.isPlaying = false;
        }
        else {
            this.audioPlayer.play();
            if (playBtn)
                playBtn.textContent = '⏸';
            this.isPlaying = true;
        }
    }
    previousSong() {
        if (this.songs.length === 0)
            return;
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(this.songs[this.currentSongIndex]);
    }
    nextSong() {
        if (this.songs.length === 0)
            return;
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(this.songs[this.currentSongIndex]);
    }
    loadSong(song) {
        if (!this.audioPlayer || !song)
            return;
        this.audioPlayer.src = song.audio_url;
        const titleEl = document.getElementById('current-song-title');
        const albumArtEl = document.getElementById('current-album-art');
        if (titleEl) {
            titleEl.textContent = song.title_korean;
        }
        if (albumArtEl && albumArtEl.src) {
            albumArtEl.src = '/static/images/default-album.jpg';
        }
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }
    updateProgress() {
        if (!this.audioPlayer)
            return;
        const progress = document.querySelector('.progress');
        const currentTimeEl = document.getElementById('current-time');
        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration;
        if (progress && duration) {
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
        }
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }
    updateDuration() {
        if (!this.audioPlayer)
            return;
        const durationEl = document.getElementById('duration');
        if (durationEl) {
            durationEl.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    seekTo(e) {
        if (!this.audioPlayer)
            return;
        const progressContainer = e.currentTarget;
        const clickX = e.offsetX;
        const width = progressContainer?.offsetWidth || 0;
        const duration = this.audioPlayer.duration;
        const seekTime = (clickX / width) * duration;
        this.audioPlayer.currentTime = seekTime;
    }
    formatTime(seconds) {
        if (isNaN(seconds))
            return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    initHTMXHandlers() {
        document.addEventListener('htmx:afterRequest', (event) => {
            if (event.detail?.target?.id === 'members-content') {
                this.handleMembersLoaded(event.detail.xhr.response);
            }
            else if (event.detail?.target?.id === 'songs-content') {
                this.handleSongsLoaded(event.detail.xhr.response);
            }
        });
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target?.closest('.song-card')) {
                const songCard = target.closest('.song-card');
                const songData = JSON.parse(songCard.dataset.song || '{}');
                this.loadSong(songData);
            }
        });
    }
    handleMembersLoaded(response) {
        try {
            const members = JSON.parse(response);
            this.renderMembers(members);
        }
        catch (error) {
            console.error('Error parsing members data:', error);
        }
    }
    handleSongsLoaded(response) {
        try {
            const songs = JSON.parse(response);
            this.songs = songs;
            this.renderSongs(songs);
        }
        catch (error) {
            console.error('Error parsing songs data:', error);
        }
    }
    renderMembers(members) {
        const container = document.getElementById('members-content');
        if (!container)
            return;
        container.innerHTML = members.map(member => `
            <div class="member-card" data-member-id="${member.id}">
                <img src="${member.image_url}" alt="${member.name_korean}" class="member-image" 
                     onerror="this.src='/static/images/default-member.jpg'">
                <h3 class="member-name">${member.name_korean} (${member.name_english})</h3>
                <p class="member-position">${member.position}</p>
                <p class="member-description">${member.description_korean}</p>
            </div>
        `).join('');
    }
    renderSongs(songs) {
        const container = document.getElementById('songs-content');
        if (!container)
            return;
        container.innerHTML = songs.map((song, index) => `
            <div class="song-card" data-song='${JSON.stringify(song)}' data-index="${index}">
                <h3 class="song-title">${song.title_korean}</h3>
                <p class="song-album">앨범: ${song.album}</p>
                <p class="song-date">${new Date(song.release_date).toLocaleDateString('ko-KR')}</p>
            </div>
        `).join('');
    }
    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href')?.substring(1) || '';
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new BTSWebsite();
});
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/js/sw.js')
            .then(registration => {
            console.log('SW registered: ', registration);
        })
            .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
//# sourceMappingURL=main.js.map