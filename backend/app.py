import os
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import os
from datetime import datetime

load_dotenv()

class BTSWebsiteApp:
    def __init__(self):
        self.app = Flask(__name__, 
                        template_folder='../templates',
                        static_folder='../static')
        CORS(self.app)
        self.setup_security_headers()
        self.setup_database()
        self.setup_routes()
    
    def setup_security_headers(self):
        @self.app.after_request
        def add_security_headers(response):
            response.headers['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "media-src 'self' https:; "
                "connect-src 'self' https:; "
                "frame-src 'self' https://www.youtube.com https://youtube.com;"
            )
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            return response
    
    def setup_database(self):
        try:
            self.db_connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'bts_website'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', 'password'),
                port=os.getenv('DB_PORT', '5432')
            )
            self.create_tables()
        except psycopg2.Error as e:
            print(f"Database connection error: {e}")
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
        
        cursor.execute('CREATE EXTENSION IF NOT EXISTS pgai CASCADE;')
        
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
        if cursor.fetchone()[0] == 0:
            members_data = [
                ('김남준', 'RM', '리더, 래퍼', '1994-09-12', 'BTS의 리더이자 메인 래퍼입니다.', 
                 ['/static/images/rm_1.jpg', '/static/images/rm_2.jpg', '/static/images/rm_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}),
                ('김석진', 'Jin', '보컬, 비주얼', '1992-12-04', 'BTS의 보컬이자 비주얼을 담당합니다.',
                 ['/static/images/jin_1.jpg', '/static/images/jin_2.jpg', '/static/images/jin_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}),
                ('민윤기', 'Suga', '래퍼, 프로듀서', '1993-03-09', 'BTS의 래퍼이자 프로듀서입니다.',
                 ['/static/images/suga_1.jpg', '/static/images/suga_2.jpg', '/static/images/suga_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}),
                ('정호석', 'J-Hope', '래퍼, 댄서', '1994-02-18', 'BTS의 래퍼이자 메인 댄서입니다.',
                 ['/static/images/jhope_1.jpg', '/static/images/jhope_2.jpg', '/static/images/jhope_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}),
                ('박지민', 'Jimin', '보컬, 댄서', '1995-10-13', 'BTS의 보컬이자 리드 댄서입니다.',
                 ['/static/images/jimin_1.jpg', '/static/images/jimin_2.jpg', '/static/images/jimin_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}),
                ('김태형', 'V', '보컬, 비주얼', '1995-12-30', 'BTS의 보컬이자 비주얼을 담당합니다.',
                 ['/static/images/v_1.jpg', '/static/images/v_2.jpg', '/static/images/v_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'}),
                ('전정국', 'Jungkook', '메인 보컬, 센터', '1997-09-01', 'BTS의 메인 보컬이자 센터입니다.',
                 ['/static/images/jungkook_1.jpg', '/static/images/jungkook_2.jpg', '/static/images/jungkook_3.jpg'],
                 {'twitter': '@BTS_twt', 'instagram': '@bts.bighitofficial', 'weverse': 'BTS Official'})
            ]
            
            for member in members_data:
                cursor.execute('''
                    INSERT INTO bts_members (name_korean, name_english, position, birth_date, description_korean, image_urls, social_media_links)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                ''', member)
        
        cursor.execute("SELECT COUNT(*) FROM songs")
        if cursor.fetchone()[0] == 0:
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
        
        self.db_connection.commit()
        cursor.close()
    
    def setup_routes(self):
        @self.app.route('/')
        def index():
            return render_template('index.html')
        
        @self.app.route('/api/members')
        def get_members():
            if not self.db_connection:
                return jsonify({'error': 'Database connection failed'}), 500
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT * FROM bts_members ORDER BY id')
            members = cursor.fetchall()
            cursor.close()
            
            return jsonify([dict(member) for member in members])
        
        @self.app.route('/api/songs')
        def get_songs():
            if not self.db_connection:
                return jsonify({'error': 'Database connection failed'}), 500
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT * FROM songs ORDER BY release_date DESC')
            songs = cursor.fetchall()
            cursor.close()
            
            return jsonify([dict(song) for song in songs])
        
        @self.app.route('/api/albums')
        def get_albums():
            if not self.db_connection:
                return jsonify({'error': 'Database connection failed'}), 500
            
            cursor = self.db_connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT * FROM albums ORDER BY release_date DESC')
            albums = cursor.fetchall()
            cursor.close()
            
            return jsonify([dict(album) for album in albums])
        
        @self.app.route('/api/recommendations', methods=['GET', 'POST'])
        def get_recommendations():
            if not self.db_connection:
                return jsonify({'error': 'Database connection failed'}), 500
            
            preferences = ''
            if request.method == 'POST':
                data = request.get_json()
                preferences = data.get('preferences', '')
            else:
                preferences = request.args.get('preferences', '')
            
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
            
            recommended_songs = [song['title_korean'] for song in recommendations]
            reason = f"Based on preferences: {preferences}" if preferences else "Popular BTS songs"
            
            cursor.execute("""
                INSERT INTO ai_recommendations (user_preferences, recommended_songs, recommendation_reason)
                VALUES (%s, %s, %s)
            """, (preferences, recommended_songs, reason))
            
            self.db_connection.commit()
            cursor.close()
            
            return jsonify([dict(song) for song in recommendations])
        
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
