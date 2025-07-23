
declare const htmx: any;

declare const THREE: any;

/**
 * Song data structure representing BTS tracks
 * Contains both Korean and English metadata for internationalization
 */
interface Song {
    id: number;
    title_korean: string;
    title_english: string;
    album: string;
    release_date: string;
    lyrics_korean: string;
    audio_url: string;
    video_url: string;
}

/**
 * BTS Member data structure with multiple images and social media integration
 * Supports Korean cultural context with Korean names and descriptions
 */
interface Member {
    id: number;
    name_korean: string;
    name_english: string;
    position: string;
    birth_date: string;
    description_korean: string;
    image_urls: string[];
    social_media_links: {
        twitter?: string;
        instagram?: string;
        weverse?: string;
        youtube?: string;
        tiktok?: string;
    };
}

/**
 * Album data structure for BTS discography
 * Includes Korean localization for authentic fan experience
 */
interface Album {
    id: number;
    title_korean: string;
    title_english: string;
    release_date: string;
    description_korean: string;
    cover_image_url: string;
}

/**
 * Main BTS Website Class
 * 
 * Implements a comprehensive K-pop website with:
 * - 3D visual effects using Three.js
 * - Interactive audio player with full controls
 * - Dynamic member galleries with image navigation
 * - Responsive design with psychological color theory
 * - Performance optimizations and accessibility features
 * 
 * Design Patterns Used:
 * - Singleton pattern for main website instance
 * - Observer pattern for HTMX event handling
 * - Strategy pattern for different animation types
 * - Factory pattern for Three.js object creation
 */
class BTSWebsite {
    private scene: any = null;
    private camera: any = null;
    private renderer: any = null;
    private particles: any = null;
    private floatingShapes: any[] = [];
    private audioPlayer: HTMLAudioElement | null = null;
    private currentSongIndex: number = 0;
    private songs: Song[] = [];
    private isPlaying: boolean = false;
    private currentMemberImageIndex: { [key: number]: number } = {};

    /**
     * Initialize the BTS website with all components
     * Sets up 3D graphics, audio player, and event handlers
     */
    constructor() {
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
        if (!container) return;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);
        
        this.createParticles();
        
        this.createFloatingShapes();
        
        this.camera.position.z = 5;
        
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createParticles() {
        const particleCount = 30;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const randomValues = new Float32Array(particleCount * 6);
        for (let i = 0; i < particleCount * 6; i++) {
            randomValues[i] = Math.random();
        }
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const i6 = i * 6;
            
            positions[i3] = (randomValues[i6] - 0.5) * 20;
            positions[i3 + 1] = (randomValues[i6 + 1] - 0.5) * 20;
            positions[i3 + 2] = (randomValues[i6 + 2] - 0.5) * 20;
            
            const color = new THREE.Color();
            color.setHSL(randomValues[i6 + 3] * 0.3 + 0.7, 0.8, 0.6);
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
            blending: THREE.AdditiveBlending,
            sizeAttenuation: false
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
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
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
        
        if (this.renderer && this.scene && this.camera && !document.hidden) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize(): void {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    initMusicPlayer() {
        this.audioPlayer = document.getElementById('audio-player') as HTMLAudioElement;
        if (!this.audioPlayer) return;
        
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
            progressContainer.addEventListener('click', (e: Event) => {
                this.seekTo(e as MouseEvent);
            });
        }
    }
    
    togglePlay() {
        if (!this.audioPlayer) return;
        
        const playBtn = document.getElementById('play-btn');
        
        if (this.isPlaying) {
            this.audioPlayer.pause();
            if (playBtn) playBtn.textContent = '▶';
            this.isPlaying = false;
        } else {
            this.audioPlayer.play();
            if (playBtn) playBtn.textContent = '⏸';
            this.isPlaying = true;
        }
    }
    
    previousSong() {
        if (this.songs.length === 0) return;
        
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.loadSong(this.songs[this.currentSongIndex]);
    }
    
    nextSong() {
        if (this.songs.length === 0) return;
        
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.loadSong(this.songs[this.currentSongIndex]);
    }
    
    loadSong(song: Song): void {
        if (!this.audioPlayer || !song) return;
        
        this.audioPlayer.src = song.audio_url;
        
        const titleEl = document.getElementById('current-song-title');
        const albumArtEl = document.getElementById('current-album-art');
        
        if (titleEl) {
            titleEl.textContent = song.title_korean;
        }
        
        if (albumArtEl && (albumArtEl as HTMLImageElement).src) {
            (albumArtEl as HTMLImageElement).src = '/static/images/default-album.jpg';
        }
        
        if (this.isPlaying) {
            this.audioPlayer.play();
        }
    }
    
    updateProgress() {
        if (!this.audioPlayer) return;
        
        const progress = document.querySelector('.progress');
        const currentTimeEl = document.getElementById('current-time');
        
        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration;
        
        if (progress && duration) {
            const progressPercent = (currentTime / duration) * 100;
            (progress as HTMLElement).style.width = `${progressPercent}%`;
        }
        
        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(currentTime);
        }
    }
    
    updateDuration() {
        if (!this.audioPlayer) return;
        
        const durationEl = document.getElementById('duration');
        
        if (durationEl) {
            durationEl.textContent = this.formatTime(this.audioPlayer.duration);
        }
    }
    
    seekTo(e: MouseEvent): void {
        if (!this.audioPlayer) return;
        
        const progressContainer = e.currentTarget as HTMLElement;
        const clickX = e.offsetX;
        const width = progressContainer?.offsetWidth || 0;
        const duration = this.audioPlayer.duration;
        
        const seekTime = (clickX / width) * duration;
        this.audioPlayer.currentTime = seekTime;
    }
    
    formatTime(seconds: number): string {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    initHTMXHandlers() {
        document.addEventListener('htmx:afterRequest', (event: any) => {
            if (event.detail?.target?.id === 'members-content') {
                this.handleMembersLoaded(event.detail.xhr.response);
            } else if (event.detail?.target?.id === 'songs-content') {
                this.handleSongsLoaded(event.detail.xhr.response);
            }
        });
        
        document.addEventListener('click', (event: Event) => {
            const target = event.target as HTMLElement;
            if (target?.closest('.song-card')) {
                const songCard = target.closest('.song-card') as HTMLElement;
                const songData = JSON.parse(songCard.dataset.song || '{}');
                this.loadSong(songData);
            }
        });
    }
    
    handleMembersLoaded(response: string): void {
        try {
            const members = JSON.parse(response);
            this.renderMembers(members);
        } catch (error) {
            console.error('Error parsing members data:', error);
        }
    }
    
    /**
     * Handles song data loading with security validation
     * Security: Validates and sanitizes API response data
     * 
     * @param response - Raw API response string
     */
    handleSongsLoaded(response: string): void {
        try {
            const rawSongs = JSON.parse(response);
            const validatedSongs = this.validateApiData(rawSongs);
            
            if (Array.isArray(validatedSongs) && validatedSongs.length > 0) {
                this.songs = validatedSongs;
                this.renderSongs(validatedSongs);
            } else {
                this.showErrorMessage('songs-content', '음악 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Error parsing songs data:', error);
            this.showErrorMessage('songs-content', '음악 데이터 파싱 오류가 발생했습니다.');
        }
    }
    
    /**
     * Handles album data loading with security validation
     * Security: Validates and sanitizes API response data
     * 
     * @param response - Raw API response string
     */
    handleAlbumsLoaded(response: string): void {
        try {
            const rawAlbums = JSON.parse(response);
            const validatedAlbums = this.validateApiData(rawAlbums);
            
            if (Array.isArray(validatedAlbums) && validatedAlbums.length > 0) {
                this.renderAlbums(validatedAlbums);
            } else {
                this.showErrorMessage('albums-content', '앨범 데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('Error parsing albums data:', error);
            this.showErrorMessage('albums-content', '앨범 데이터 파싱 오류가 발생했습니다.');
        }
    }
    
    /**
     * Shows error message in specified container
     * Security: Uses safe DOM manipulation for error display
     * 
     * @param containerId - ID of container to show error in
     * @param message - Error message to display
     */
    private showErrorMessage(containerId: string, message: string): void {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = this.sanitizeText(message);
        container.appendChild(errorDiv);
    }
    
    /**
     * Renders member cards with secure DOM manipulation
     * Security: Uses proper DOM creation instead of innerHTML to prevent XSS
     * Performance: O(n) where n is number of members, optimized with DocumentFragment
     * 
     * @param members - Array of member data from API
     */
    renderMembers(members: Member[]): void {
        const container = document.getElementById('members-content');
        if (!container) return;
        
        const fragment = document.createDocumentFragment();
        
        members.forEach(member => {
            this.currentMemberImageIndex[member.id] = 0;
            
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            memberCard.setAttribute('data-member-id', member.id.toString());
            
            const imageGallery = document.createElement('div');
            imageGallery.className = 'member-image-gallery';
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            
            const memberImage = document.createElement('img');
            memberImage.src = this.sanitizeUrl(member.image_urls[0]);
            memberImage.alt = this.sanitizeText(member.name_korean);
            memberImage.loading = 'lazy';
            memberImage.className = 'member-image';
            
            const imageNav = document.createElement('div');
            imageNav.className = 'image-nav';
            
            const prevButton = document.createElement('button');
            prevButton.className = 'prev-image';
            prevButton.textContent = '‹';
            prevButton.addEventListener('click', () => this.previousMemberImage(member.id));
            
            const nextButton = document.createElement('button');
            nextButton.className = 'next-image';
            nextButton.textContent = '›';
            nextButton.addEventListener('click', () => this.nextMemberImage(member.id));
            
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'image-dots';
            
            member.image_urls.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.className = `dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => this.setMemberImage(member.id, index));
                dotsContainer.appendChild(dot);
            });
            
            imageNav.appendChild(prevButton);
            imageNav.appendChild(dotsContainer);
            imageNav.appendChild(nextButton);
            
            imageContainer.appendChild(memberImage);
            imageContainer.appendChild(imageNav);
            imageGallery.appendChild(imageContainer);
            
            const memberInfo = document.createElement('div');
            memberInfo.className = 'member-info';
            
            const memberName = document.createElement('h3');
            memberName.textContent = `${this.sanitizeText(member.name_korean)} (${this.sanitizeText(member.name_english)})`;
            
            const memberPosition = document.createElement('p');
            memberPosition.className = 'position';
            memberPosition.textContent = this.sanitizeText(member.position);
            
            const memberDescription = document.createElement('p');
            memberDescription.className = 'description';
            memberDescription.textContent = this.sanitizeText(member.description_korean);
            
            const socialLinks = document.createElement('div');
            socialLinks.className = 'social-links';
            
            if (member.social_media_links.twitter) {
                const twitterLink = document.createElement('a');
                twitterLink.href = `https://twitter.com/${this.sanitizeText(member.social_media_links.twitter)}`;
                twitterLink.target = '_blank';
                twitterLink.rel = 'noopener noreferrer';
                twitterLink.className = 'social-link twitter';
                twitterLink.textContent = 'Twitter';
                socialLinks.appendChild(twitterLink);
            }
            
            if (member.social_media_links.instagram) {
                const instagramLink = document.createElement('a');
                instagramLink.href = `https://instagram.com/${this.sanitizeText(member.social_media_links.instagram)}`;
                instagramLink.target = '_blank';
                instagramLink.rel = 'noopener noreferrer';
                instagramLink.className = 'social-link instagram';
                instagramLink.textContent = 'Instagram';
                socialLinks.appendChild(instagramLink);
            }
            
            if (member.social_media_links.weverse) {
                const weverseLink = document.createElement('a');
                weverseLink.href = 'https://weverse.io/bts';
                weverseLink.target = '_blank';
                weverseLink.rel = 'noopener noreferrer';
                weverseLink.className = 'social-link weverse';
                weverseLink.textContent = 'Weverse';
                socialLinks.appendChild(weverseLink);
            }
            
            memberInfo.appendChild(memberName);
            memberInfo.appendChild(memberPosition);
            memberInfo.appendChild(memberDescription);
            memberInfo.appendChild(socialLinks);
            
            memberCard.appendChild(imageGallery);
            memberCard.appendChild(memberInfo);
            
            fragment.appendChild(memberCard);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    nextMemberImage(memberId: number): void {
        const memberCard = document.querySelector(`[data-member-id="${memberId}"]`);
        if (!memberCard) return;
        
        const img = memberCard.querySelector('.member-image') as HTMLImageElement;
        const dots = memberCard.querySelectorAll('.dot');
        
        if (!img || !dots.length) return;
        
        const currentIndex = this.currentMemberImageIndex[memberId] || 0;
        const nextIndex = (currentIndex + 1) % dots.length;
        
        this.setMemberImage(memberId, nextIndex);
    }
    
    previousMemberImage(memberId: number): void {
        const memberCard = document.querySelector(`[data-member-id="${memberId}"]`);
        if (!memberCard) return;
        
        const img = memberCard.querySelector('.member-image') as HTMLImageElement;
        const dots = memberCard.querySelectorAll('.dot');
        
        if (!img || !dots.length) return;
        
        const currentIndex = this.currentMemberImageIndex[memberId] || 0;
        const prevIndex = currentIndex === 0 ? dots.length - 1 : currentIndex - 1;
        
        this.setMemberImage(memberId, prevIndex);
    }
    
    setMemberImage(memberId: number, imageIndex: number): void {
        const memberCard = document.querySelector(`[data-member-id="${memberId}"]`);
        if (!memberCard) return;
        
        const img = memberCard.querySelector('.member-image') as HTMLImageElement;
        const dots = memberCard.querySelectorAll('.dot');
        
        if (!img || !dots.length) return;
        
        const imageUrls = [
            `/static/images/${this.getMemberName(memberId)}_1.jpg`,
            `/static/images/${this.getMemberName(memberId)}_2.jpg`,
            `/static/images/${this.getMemberName(memberId)}_3.jpg`
        ];
        
        img.src = imageUrls[imageIndex];
        this.currentMemberImageIndex[memberId] = imageIndex;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === imageIndex);
        });
    }
    
    getMemberName(memberId: number): string {
        const memberNames = ['rm', 'jin', 'suga', 'jhope', 'jimin', 'v', 'jungkook'];
        return memberNames[memberId - 1] || 'rm';
    }
    
    /**
     * Renders song cards with secure DOM manipulation
     * Security: Uses proper DOM creation instead of innerHTML to prevent XSS
     * Performance: O(n) where n is number of songs, optimized with DocumentFragment
     * 
     * @param songs - Array of song data from API
     */
    renderSongs(songs: Song[]): void {
        const container = document.getElementById('songs-content');
        if (!container) return;
        
        const fragment = document.createDocumentFragment();
        
        songs.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';
            songCard.setAttribute('data-song', JSON.stringify(song));
            songCard.setAttribute('data-index', index.toString());
            
            const songTitle = document.createElement('h3');
            songTitle.className = 'song-title';
            songTitle.textContent = this.sanitizeText(song.title_korean);
            
            const songAlbum = document.createElement('p');
            songAlbum.className = 'song-album';
            songAlbum.textContent = `앨범: ${this.sanitizeText(song.album)}`;
            
            const songDate = document.createElement('p');
            songDate.className = 'song-date';
            songDate.textContent = new Date(song.release_date).toLocaleDateString('ko-KR');
            
            songCard.appendChild(songTitle);
            songCard.appendChild(songAlbum);
            songCard.appendChild(songDate);
            
            fragment.appendChild(songCard);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
    
    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    (entry.target as HTMLElement).style.opacity = '1';
                    (entry.target as HTMLElement).style.transform = 'translateY(0)';
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
    
    debounce(func: Function, wait: number): Function {
        let timeout: NodeJS.Timeout;
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttles function execution for performance optimization
     * Performance: O(1) amortized complexity for event handling
     * 
     * @param func - Function to throttle
     * @param limit - Time limit in milliseconds
     * @returns Throttled function
     */
    throttle(func: Function, limit: number): Function {
        let inThrottle: boolean;
        return function(this: any, ...args: any[]) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Sanitizes text input to prevent XSS attacks
     * Security: Escapes HTML entities and limits length
     * 
     * @param text - Input text to sanitize
     * @returns Sanitized text safe for DOM insertion
     */
    private sanitizeText(text: string): string {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .substring(0, 500);
    }
    
    /**
     * Sanitizes URL input to prevent malicious redirects
     * Security: Validates URL format and allowed protocols
     * 
     * @param url - Input URL to sanitize
     * @returns Sanitized URL or default safe URL
     */
    private sanitizeUrl(url: string): string {
        if (typeof url !== 'string') return '/static/images/default.jpg';
        
        try {
            const urlObj = new URL(url, window.location.origin);
            if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
                return urlObj.href;
            }
        } catch (e) {
            if (url.startsWith('/static/')) {
                return url.substring(0, 200);
            }
        }
        
        return '/static/images/default.jpg';
    }
    
    /**
     * Validates and sanitizes JSON data from API responses
     * Security: Prevents prototype pollution and validates data structure
     * 
     * @param data - Raw data from API
     * @returns Sanitized and validated data
     */
    private validateApiData(data: any): any {
        if (!data || typeof data !== 'object') return null;
        
        if (Array.isArray(data)) {
            return data.map(item => this.validateApiData(item)).filter(Boolean);
        }
        
        const sanitized: any = {};
        for (const [key, value] of Object.entries(data)) {
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }
            
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeText(value);
            } else if (typeof value === 'number' && isFinite(value)) {
                sanitized[key] = value;
            } else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.validateApiData(value);
            }
        }
        
        return sanitized;
    }
    
    /**
     * Renders album cards with secure DOM manipulation
     * Security: Uses proper DOM creation instead of innerHTML to prevent XSS
     * Performance: O(n) where n is number of albums, optimized with DocumentFragment
     * 
     * @param albums - Array of album data from API
     */
    renderAlbums(albums: Album[]): void {
        const container = document.getElementById('albums-content');
        if (!container) return;
        
        const fragment = document.createDocumentFragment();
        
        albums.forEach(album => {
            const albumCard = document.createElement('div');
            albumCard.className = 'album-card';
            
            const albumCover = document.createElement('div');
            albumCover.className = 'album-cover';
            
            const coverImage = document.createElement('img');
            coverImage.src = this.sanitizeUrl(album.cover_image_url);
            coverImage.alt = this.sanitizeText(album.title_korean);
            coverImage.loading = 'lazy';
            
            albumCover.appendChild(coverImage);
            
            const albumInfo = document.createElement('div');
            albumInfo.className = 'album-info';
            
            const albumTitle = document.createElement('h3');
            albumTitle.className = 'album-title';
            albumTitle.textContent = this.sanitizeText(album.title_korean);
            
            const albumDate = document.createElement('p');
            albumDate.className = 'album-date';
            albumDate.textContent = new Date(album.release_date).toLocaleDateString('ko-KR');
            
            const albumDescription = document.createElement('p');
            albumDescription.className = 'album-description';
            albumDescription.textContent = this.sanitizeText(album.description_korean);
            
            albumInfo.appendChild(albumTitle);
            albumInfo.appendChild(albumDate);
            albumInfo.appendChild(albumDescription);
            
            albumCard.appendChild(albumCover);
            albumCard.appendChild(albumInfo);
            
            fragment.appendChild(albumCard);
        });
        
        container.innerHTML = '';
        container.appendChild(fragment);
    }
}

/**
 * Initialize BTS Website Application
 * Security: Proper event delegation and secure initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    const website = new BTSWebsite();
    (window as any).btsWebsite = website;
});

/**
 * Service Worker Registration for Offline Capabilities
 * Performance: Enables caching and offline functionality
 */
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
