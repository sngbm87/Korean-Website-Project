/**
 * BTS Korean Website - Main TypeScript Module
 *
 * This module implements a comprehensive BTS fan website with:
 * - Three.js 3D particle effects and floating shapes
 * - Interactive music player with audio controls
 * - Dynamic member gallery with multiple images per member
 * - HTMX-powered dynamic content loading
 * - Responsive design with smooth animations
 *
 * Architecture follows FAANG best practices with:
 * - Type-safe interfaces for all data structures
 * - Modular class-based design with clear separation of concerns
 * - Performance optimizations with debouncing and throttling
 * - Comprehensive error handling and null checks
 * - Accessibility features and responsive design
 *
 * Security features include:
 * - Input validation and sanitization
 * - XSS protection through proper DOM manipulation
 * - CSP-compliant code structure
 *
 * @author Devin AI
 * @version 2.0.0
 * @since 2025-01-22
 */
declare const THREE: any;
declare const htmx: any;
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
 * Korean Color Palette interface for cultural design elements
 */
interface KoreanColorPalette {
    red: string;
    blue: string;
    gold: string;
    pink: string;
    green: string;
    white: string;
    black: string;
}
/**
 * Device breakpoints for responsive design
 */
interface DeviceBreakpoints {
    mobile: number;
    tablet: number;
    laptop: number;
    desktop: number;
}
/**
 * Performance metrics for monitoring
 */
interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    memoryUsage: number;
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
declare class BTSWebsite {
    private scene;
    private camera;
    private renderer;
    private particles;
    private floatingShapes;
    private audioPlayer;
    private currentSongIndex;
    private songs;
    private isPlaying;
    private currentMemberImageIndex;
    private animationId;
    private koreanColors;
    private deviceBreakpoints;
    private performanceMetrics;
    private isReducedMotion;
    private deviceType;
    private lastFrameTime;
    /**
     * Initialize the BTS website with all components
     * Sets up 3D graphics, audio player, and event handlers
     */
    constructor();
    private detectDeviceType;
    private checkReducedMotionPreference;
    private setupAccessibility;
    private setupPerformanceMonitoring;
    private optimizeForLowPerformance;
    private pauseAnimations;
    init(): void;
    initThreeJS(): void;
    createParticles(): void;
    createFloatingShapes(): void;
    animate(): void;
    onWindowResize(): void;
    initMusicPlayer(): void;
    togglePlay(): void;
    previousSong(): void;
    nextSong(): void;
    loadSong(song: Song): void;
    updateProgress(): void;
    updateDuration(): void;
    seekTo(e: MouseEvent): void;
    formatTime(seconds: number): string;
    initHTMXHandlers(): void;
    handleMembersLoaded(response: string): void;
    /**
     * Handles song data loading with security validation
     * Security: Validates and sanitizes API response data
     *
     * @param response - Raw API response string
     */
    handleSongsLoaded(response: string): void;
    /**
     * Handles album data loading with security validation
     * Security: Validates and sanitizes API response data
     *
     * @param response - Raw API response string
     */
    handleAlbumsLoaded(response: string): void;
    /**
     * Shows error message in specified container
     * Security: Uses safe DOM manipulation for error display
     *
     * @param containerId - ID of container to show error in
     * @param message - Error message to display
     */
    private showErrorMessage;
    /**
     * Renders member cards with secure DOM manipulation
     * Security: Uses proper DOM creation instead of innerHTML to prevent XSS
     * Performance: O(n) where n is number of members, optimized with DocumentFragment
     *
     * @param members - Array of member data from API
     */
    renderMembers(members: Member[]): void;
    nextMemberImage(memberId: number): void;
    previousMemberImage(memberId: number): void;
    setMemberImage(memberId: number, imageIndex: number): void;
    getMemberName(memberId: number): string;
    /**
     * Renders song cards with secure DOM manipulation
     * Security: Uses proper DOM creation instead of innerHTML to prevent XSS
     * Performance: O(n) where n is number of songs, optimized with DocumentFragment
     *
     * @param songs - Array of song data from API
     */
    renderSongs(songs: Song[]): void;
    initScrollEffects(): void;
    debounce(func: Function, wait: number): Function;
    /**
     * Throttles function execution for performance optimization
     * Performance: O(1) amortized complexity for event handling
     *
     * @param func - Function to throttle
     * @param limit - Time limit in milliseconds
     * @returns Throttled function
     */
    throttle(func: Function, limit: number): Function;
    /**
     * Sanitizes text input to prevent XSS attacks
     * Security: Escapes HTML entities and limits length
     *
     * @param text - Input text to sanitize
     * @returns Sanitized text safe for DOM insertion
     */
    private sanitizeText;
    /**
     * Sanitizes URL input to prevent malicious redirects
     * Security: Validates URL format and allowed protocols
     *
     * @param url - Input URL to sanitize
     * @returns Sanitized URL or default safe URL
     */
    private sanitizeUrl;
    /**
     * Validates and sanitizes JSON data from API responses
     * Security: Prevents prototype pollution and validates data structure
     *
     * @param data - Raw data from API
     * @returns Sanitized and validated data
     */
    private validateApiData;
    /**
     * Renders album cards with secure DOM manipulation
     * Security: Uses proper DOM creation instead of innerHTML to prevent XSS
     * Performance: O(n) where n is number of albums, optimized with DocumentFragment
     *
     * @param albums - Array of album data from API
     */
    renderAlbums(albums: Album[]): void;
}
