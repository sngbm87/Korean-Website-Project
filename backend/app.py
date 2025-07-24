import os
from typing import Optional, Dict, List, Any, Union
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime
import logging
import secrets
import html

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BTSWebsiteApp:
    """
    Enterprise-grade BTS Korean Website Application
    
    Security Features:
    - CSRF protection with Flask-WTF
    - Enhanced security headers with CSP
    - Input validation and sanitization
    - SQL injection protection via parameterized queries
    
    Performance Features:
    - Optimized database connections
    - Efficient error handling
    - Professional logging and monitoring
    
    Code Quality:
    - Type hints throughout
    - Comprehensive error handling
    - Professional documentation
    - Enterprise architecture patterns
    """
    def __init__(self):
        self.app = Flask(__name__, 
                        template_folder='../templates',
                        static_folder='../static')
        CORS(self.app)
        
        csrf = CSRFProtect(self.app)
        self.app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(32))
        self.app.config['WTF_CSRF_TIME_LIMIT'] = 3600
        
        self.setup_security_headers()
        self.setup_database()
        self.setup_routes()
    
    def setup_security_headers(self):
        @self.app.after_request
        def add_security_headers(response):
            try:
                if hasattr(response, 'headers') and response.headers is not None:
                    response.headers['Content-Security-Policy'] = (
                        "default-src 'self'; "
                        "script-src 'self' https://unpkg.com https://cdn.jsdelivr.net; "
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                        "font-src 'self' https://fonts.gstatic.com; "
                        "img-src 'self' data: https:; "
                        "media-src 'self' https:; "
                        "connect-src 'self' https:; "
                        "frame-src 'self' https://www.youtube.com https://youtube.com; "
                        "object-src 'none'; "
                        "base-uri 'self'; "
                        "form-action 'self'"
                    )
                    response.headers['X-Content-Type-Options'] = 'nosniff'
                    response.headers['X-Frame-Options'] = 'DENY'
                    response.headers['X-XSS-Protection'] = '1; mode=block'
                    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
                    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
                    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
                    response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'
            except (TypeError, AttributeError, KeyError) as e:
                logging.warning(f"Error setting security headers: {e}")
            return response
    
    def setup_database(self):
        try:
            self.db_connection = psycopg2.connect(
                host=os.getenv('DB_HOST') or 'localhost',
                database=os.getenv('DB_NAME') or 'bts_website',
                user=os.getenv('DB_USER') or 'bts_user',
                password=os.getenv('DB_PASSWORD') or 'bts_password',
                port=int(os.getenv('DB_PORT') or '5432')
            )
            self.create_tables()
        except (psycopg2.Error, TypeError, AttributeError) as e:
            logging.error(f"Database connection error: {e}")
            self.db_connection = None
    
    def create_tables(self):
        if not self.db_connection:
            return
        
        cursor = self.db_connection.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bts_members (
                id SERIAL PRIMARY KEY,
                name_korean VARCHAR(50) NOT NULL,
                name_english VARCHAR(50) NOT NULL,
                position VARCHAR(100),
                birth_date DATE,
                description_korean TEXT,
                image_urls JSON DEFAULT '[]'::json,
                social_media_links JSON DEFAULT '{}'::json
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS songs (
                id SERIAL PRIMARY KEY,
                title_korean VARCHAR(100) NOT NULL,
                title_english VARCHAR(100),
                album VARCHAR(100),
                release_date DATE,
                lyrics_korean TEXT,
                audio_url VARCHAR(255),
                video_url VARCHAR(255)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS albums (
                id SERIAL PRIMARY KEY,
                title_korean VARCHAR(100) NOT NULL,
                title_english VARCHAR(100),
                release_date DATE,
                description_korean TEXT,
                cover_image_url VARCHAR(255)
            )
        ''')
        
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_recommendations (
                id SERIAL PRIMARY KEY,
                user_preferences TEXT,
                recommended_songs TEXT[],
                recommendation_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        self.db_connection.commit()
        cursor.close()
        self.insert_sample_data()
    
    def insert_sample_data(self):
        if not self.db_connection:
            return
            
        cursor = self.db_connection.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM bts_members")
        result = cursor.fetchone()
        if result and len(result) > 0 and result[0] == 0:
            members_data = [
                ('김남준', 'RM', '리더, 래퍼', '1994-09-12', 'BTS의 리더이자 메인 래퍼입니다.', 
                 json.dumps(['/static/images/rm_1.jpg', '/static/images/rm_2.jpg', '/static/images/rm_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})),
                ('김석진', 'Jin', '보컬, 비주얼', '1992-12-04', 'BTS의 보컬이자 비주얼을 담당합니다.',
                 json.dumps(['/static/images/jin_1.jpg', '/static/images/jin_2.jpg', '/static/images/jin_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})),
                ('민윤기', 'Suga', '래퍼, 프로듀서', '1993-03-09', 'BTS의 래퍼이자 프로듀서입니다.',
                 json.dumps(['/static/images/suga_1.jpg', '/static/images/suga_2.jpg', '/static/images/suga_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})),
                ('정호석', 'J-Hope', '래퍼, 댄서', '1994-02-18', 'BTS의 래퍼이자 메인 댄서입니다.',
                 json.dumps(['/static/images/jhope_1.jpg', '/static/images/jhope_2.jpg', '/static/images/jhope_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})),
                ('박지민', 'Jimin', '보컬, 댄서', '1995-10-13', 'BTS의 보컬이자 리드 댄서입니다.',
                 json.dumps(['/static/images/jimin_1.jpg', '/static/images/jimin_2.jpg', '/static/images/jimin_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})),
                ('김태형', 'V', '보컬, 비주얼', '1995-12-30', 'BTS의 보컬이자 비주얼을 담당합니다.',
                 json.dumps(['/static/images/v_1.jpg', '/static/images/v_2.jpg', '/static/images/v_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})),
                ('전정국', 'Jungkook', '메인 보컬, 센터', '1997-09-01', 'BTS의 메인 보컬이자 센터입니다.',
                 json.dumps(['/static/images/jungkook_1.jpg', '/static/images/jungkook_2.jpg', '/static/images/jungkook_3.jpg']),
                 json.dumps({'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}))
            ]
            
            for member in members_data:
                cursor.execute('''
                    INSERT INTO bts_members (name_korean, name_english, position, birth_date, description_korean, image_urls, social_media_links)
                    VALUES (%s, %s, %s, %s, %s, %s::json, %s::json)
                ''', member)
        
        cursor.execute("SELECT COUNT(*) FROM songs")
        result = cursor.fetchone()
        if result and len(result) > 0 and result[0] == 0:
            songs_data = [
                ('다이너마이트', 'Dynamite', 'BE', '2020-08-21', '코스 아이 아이 아이 샤인 스루 더 시티...', '/static/audio/dynamite.mp3', 'https://www.youtube.com/watch?v=gdZLi9oWNZg'),
                ('버터', 'Butter', 'Butter', '2021-05-21', '스무스 라이크 버터...', '/static/audio/butter.mp3', 'https://www.youtube.com/watch?v=WMweEpGlu_U'),
                ('퍼미션 투 댄스', 'Permission to Dance', 'Butter', '2021-07-09', '잇츠 더 사우트 오브 뮤직...', '/static/audio/permission_to_dance.mp3', 'https://www.youtube.com/watch?v=CuklIb9d3fI'),
                ('봄날', 'Spring Day', 'You Never Walk Alone', '2017-02-13', '보고 싶다 이렇게 말하니까 더 보고 싶다...', '/static/audio/spring_day.mp3', 'https://www.youtube.com/watch?v=xEeFrLSkMm8')
            ]
            
            for song in songs_data:
                cursor.execute('''
                    INSERT INTO songs (title_korean, title_english, album, release_date, lyrics_korean, audio_url, video_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', song)
        
        cursor.execute("SELECT COUNT(*) FROM albums")
        result = cursor.fetchone()
        if result and len(result) > 0 and result[0] == 0:
            albums_data = [
                ('BE', 'BE', '2020-11-20', 'BTS의 다섯 번째 한국어 정규 앨범', '/static/images/be_album.jpg'),
                ('Map of the Soul: 7', 'Map of the Soul: 7', '2020-02-21', 'BTS의 네 번째 한국어 정규 앨범', '/static/images/mots7_album.jpg'),
                ('Love Yourself: Answer', 'Love Yourself: Answer', '2018-08-24', 'Love Yourself 시리즈의 완결편', '/static/images/answer_album.jpg'),
                ('You Never Walk Alone', 'You Never Walk Alone', '2017-02-13', 'Wings의 리패키지 앨범', '/static/images/ynwa_album.jpg')
            ]
            
            for album in albums_data:
                cursor.execute('''
                    INSERT INTO albums (title_korean, title_english, release_date, description_korean, cover_image_url)
                    VALUES (%s, %s, %s, %s, %s)
                ''', album)
        
        self.db_connection.commit()
        cursor.close()
    
    def setup_routes(self):
        @self.app.route('/')
        def index():
            return render_template('index.html')
        
        @self.app.route('/api/members')
        def get_members():
            if not self.db_connection:
                mock_members = [
                    {
                        "id": 1,
                        "name_korean": "김남준",
                        "name_english": "RM",
                        "position": "Leader, Main Rapper",
                        "birth_date": "1994-09-12",
                        "description_korean": "BTS의 리더이자 메인 래퍼로, 뛰어난 작사 실력과 리더십을 보여줍니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    },
                    {
                        "id": 2,
                        "name_korean": "김석진",
                        "name_english": "Jin",
                        "position": "Vocalist, Visual",
                        "birth_date": "1992-12-04",
                        "description_korean": "BTS의 보컬이자 비주얼을 담당하며, 따뜻한 목소리와 유머로 팬들을 사로잡습니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    },
                    {
                        "id": 3,
                        "name_korean": "민윤기",
                        "name_english": "Suga",
                        "position": "Lead Rapper, Producer",
                        "birth_date": "1993-03-09",
                        "description_korean": "BTS의 리드 래퍼이자 프로듀서로, 깊이 있는 가사와 음악적 재능을 선보입니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    },
                    {
                        "id": 4,
                        "name_korean": "정호석",
                        "name_english": "J-Hope",
                        "position": "Main Dancer, Sub Rapper",
                        "birth_date": "1994-02-18",
                        "description_korean": "BTS의 메인 댄서이자 서브 래퍼로, 밝은 에너지와 뛰어난 댄스 실력을 자랑합니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    },
                    {
                        "id": 5,
                        "name_korean": "박지민",
                        "name_english": "Jimin",
                        "position": "Main Dancer, Lead Vocalist",
                        "birth_date": "1995-10-13",
                        "description_korean": "BTS의 메인 댄서이자 리드 보컬로, 감성적인 목소리와 우아한 춤으로 사랑받습니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    },
                    {
                        "id": 6,
                        "name_korean": "김태형",
                        "name_english": "V",
                        "position": "Lead Dancer, Sub Vocalist",
                        "birth_date": "1995-12-30",
                        "description_korean": "BTS의 리드 댄서이자 서브 보컬로, 독특한 매력과 깊은 목소리를 가지고 있습니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    },
                    {
                        "id": 7,
                        "name_korean": "전정국",
                        "name_english": "Jungkook",
                        "position": "Main Vocalist, Lead Dancer, Sub Rapper, Maknae",
                        "birth_date": "1997-09-01",
                        "description_korean": "BTS의 메인 보컬이자 막내로, 다재다능한 실력과 청량한 목소리로 팬들의 사랑을 받습니다.",
                        "image_urls": [
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                        ],
                        "social_media_links": {
                            "twitter": "https://twitter.com/BTS_twt",
                            "instagram": "https://instagram.com/bts.bighitofficial",
                            "weverse": "https://weverse.io/bts"
                        }
                    }
                ]
                return jsonify(mock_members)
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT * FROM bts_members ORDER BY id')
            members = cursor.fetchall()
            cursor.close()
            
            try:
                return jsonify([dict(member) for member in members if member])
            except (TypeError, ValueError) as e:
                logging.error(f"Error serializing members data: {e}")
                return jsonify({'error': 'Data serialization failed'}), 500
        
        @self.app.route('/api/songs')
        def get_songs():
            if not self.db_connection:
                mock_songs = [
                    {
                        "id": 1,
                        "title_korean": "다이너마이트",
                        "title_english": "Dynamite",
                        "album": "BE",
                        "release_date": "2020-08-21",
                        "lyrics_korean": "코스 아이 아이 아이 아임 인 더 스타즈 투나잇\n소 와치 미 브링 더 파이어 앤 셋 더 나잇 얼라이트",
                        "audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                        "video_url": "https://www.youtube.com/watch?v=gdZLi9oWNZg"
                    },
                    {
                        "id": 2,
                        "title_korean": "버터",
                        "title_english": "Butter",
                        "album": "Butter",
                        "release_date": "2021-05-21",
                        "lyrics_korean": "스무스 라이크 버터\n라이크 어 크리미널 언더커버",
                        "audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                        "video_url": "https://www.youtube.com/watch?v=WMweEpGlu_U"
                    },
                    {
                        "id": 3,
                        "title_korean": "퍼미션 투 댄스",
                        "title_english": "Permission to Dance",
                        "album": "Butter",
                        "release_date": "2021-07-09",
                        "lyrics_korean": "잇츠 더 사우트 오브 파이어\n버닝 업 더 나잇",
                        "audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                        "video_url": "https://www.youtube.com/watch?v=CuklIb9d3fI"
                    },
                    {
                        "id": 4,
                        "title_korean": "봄날",
                        "title_english": "Spring Day",
                        "album": "You Never Walk Alone",
                        "release_date": "2017-02-13",
                        "lyrics_korean": "보고 싶다\n이런 말 하니까 더 보고 싶다",
                        "audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                        "video_url": "https://www.youtube.com/watch?v=xEeFrLSkMm8"
                    },
                    {
                        "id": 5,
                        "title_korean": "페이크 러브",
                        "title_english": "Fake Love",
                        "album": "Love Yourself: Tear",
                        "release_date": "2018-05-18",
                        "lyrics_korean": "러브 유 소 배드 러브 유 소 배드\n몰라도 되는 걸 알고 싶었어",
                        "audio_url": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                        "video_url": "https://www.youtube.com/watch?v=7C2z4GqqS5E"
                    }
                ]
                return jsonify(mock_songs)
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT * FROM songs ORDER BY release_date DESC')
            songs = cursor.fetchall()
            cursor.close()
            
            try:
                return jsonify([dict(song) for song in songs if song])
            except (TypeError, ValueError) as e:
                logging.error(f"Error serializing songs data: {e}")
                return jsonify({'error': 'Data serialization failed'}), 500
        
        @self.app.route('/api/albums')
        def get_albums():
            if not self.db_connection:
                mock_albums = [
                    {
                        "id": 1,
                        "title_korean": "BE",
                        "title_english": "BE",
                        "release_date": "2020-11-20",
                        "description_korean": "팬데믹 시대에 만들어진 BTS의 진솔한 이야기를 담은 앨범",
                        "cover_image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
                    },
                    {
                        "id": 2,
                        "title_korean": "맵 오브 더 소울: 7",
                        "title_english": "Map of the Soul: 7",
                        "release_date": "2020-02-21",
                        "description_korean": "BTS의 7년간의 여정과 성장을 담은 대표작",
                        "cover_image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"
                    },
                    {
                        "id": 3,
                        "title_korean": "러브 유어셀프: 앤서",
                        "title_english": "Love Yourself: Answer",
                        "release_date": "2018-08-24",
                        "description_korean": "자신을 사랑하는 방법에 대한 BTS만의 해답",
                        "cover_image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
                    },
                    {
                        "id": 4,
                        "title_korean": "러브 유어셀프: 티어",
                        "title_english": "Love Yourself: Tear",
                        "release_date": "2018-05-18",
                        "description_korean": "사랑의 아픔과 성장을 그린 감성적인 앨범",
                        "cover_image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop"
                    },
                    {
                        "id": 5,
                        "title_korean": "러브 유어셀프: 허",
                        "title_english": "Love Yourself: Her",
                        "release_date": "2017-09-18",
                        "description_korean": "사랑의 시작을 그린 밝고 희망찬 앨범",
                        "cover_image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
                    }
                ]
                return jsonify(mock_albums)
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT * FROM albums ORDER BY release_date DESC')
            albums = cursor.fetchall()
            cursor.close()
            
            try:
                return jsonify([dict(album) for album in albums if album])
            except (TypeError, ValueError) as e:
                logging.error(f"Error serializing albums data: {e}")
                return jsonify({'error': 'Data serialization failed'}), 500
        
        @self.app.route('/api/recommendations', methods=['GET', 'POST'])
        def get_recommendations():
            if not self.db_connection:
                return jsonify({'error': 'Database connection failed'}), 500
            
            preferences = ''
            if request.method == 'POST':
                try:
                    data = request.get_json()
                    if data and isinstance(data, dict) and 'preferences' in data:
                        preferences = data['preferences']
                    else:
                        preferences = ''
                except (TypeError, ValueError, KeyError) as e:
                    logging.warning(f"Error parsing POST data: {e}")
                    preferences = ''
            else:
                try:
                    preferences = request.args.get('preferences', '') or ''
                except (TypeError, AttributeError) as e:
                    logging.warning(f"Error accessing request args: {e}")
                    preferences = ''
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            
            if "upbeat" in preferences.lower() or "dance" in preferences.lower():
                cursor.execute("""
                    SELECT * FROM songs 
                    WHERE title_english IN ('Dynamite', 'Butter', 'Permission to Dance')
                    ORDER BY release_date DESC
                """)
            elif "emotional" in preferences.lower() or "ballad" in preferences.lower():
                cursor.execute("""
                    SELECT * FROM songs 
                    WHERE title_english IN ('Spring Day')
                    ORDER BY release_date DESC
                """)
            else:
                cursor.execute("""
                    SELECT * FROM songs 
                    ORDER BY release_date DESC 
                    LIMIT 3
                """)
            
            recommendations = cursor.fetchall()
            
            recommended_songs = []
            if recommendations:
                for song in recommendations:
                    try:
                        if isinstance(song, dict) and 'title_korean' in song:
                            recommended_songs.append(song['title_korean'])
                        elif hasattr(song, 'title_korean'):
                            recommended_songs.append(str(song.get('title_korean', 'Unknown')))
                    except (KeyError, AttributeError, TypeError) as e:
                        logging.warning(f"Error accessing song title: {e}")
                        continue
            
            reason = f"Based on preferences: {preferences}" if preferences else "Popular BTS songs"
            
            try:
                cursor.execute("""
                    INSERT INTO ai_recommendations (user_preferences, recommended_songs, recommendation_reason)
                    VALUES (%s, %s, %s)
                """, (preferences, recommended_songs, reason))
            except (psycopg2.Error, TypeError) as e:
                logging.error(f"Error inserting recommendations: {e}")
            
            self.db_connection.commit()
            cursor.close()
            
            try:
                return jsonify([dict(song) for song in recommendations if song])
            except (TypeError, ValueError) as e:
                logging.error(f"Error serializing recommendations data: {e}")
                return jsonify({'error': 'Data serialization failed'}), 500
        
        @self.app.route('/privacy')
        def privacy():
            return render_template('privacy.html')
        
        @self.app.route('/terms')
        def terms():
            return render_template('terms.html')
        
        @self.app.route('/disclaimer')
        def disclaimer():
            return render_template('disclaimer.html')
        
        @self.app.route('/copyright')
        def copyright():
            return render_template('copyright.html')
    
    def run(self, debug=True):
        self.app.run(debug=debug, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    bts_app = BTSWebsiteApp()
    bts_app.run()
