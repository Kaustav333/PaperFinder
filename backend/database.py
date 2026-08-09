import sqlite3
import json
import time
from typing import List, Optional

DB_FILE = "cache.db"
CACHE_EXPIRY_SECONDS = 24 * 60 * 60

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS search_cache (
            query TEXT PRIMARY KEY,
            timestamp REAL,
            results TEXT
        )
    ''')
    conn.commit()
    conn.close()

def get_cached_results(query: str) -> Optional[List[dict]]:
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT timestamp, results FROM search_cache WHERE query = ?', (query,))
    row = c.fetchone()
    conn.close()
    
    if row:
        timestamp, results_json = row
        if time.time() - timestamp < CACHE_EXPIRY_SECONDS:
            return json.loads(results_json)
        else:
            # Delete expired cache
            conn = sqlite3.connect(DB_FILE)
            conn.execute('DELETE FROM search_cache WHERE query = ?', (query,))
            conn.commit()
            conn.close()
            
    return None

def set_cached_results(query: str, results: List[dict]):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT OR REPLACE INTO search_cache (query, timestamp, results)
        VALUES (?, ?, ?)
    ''', (query, time.time(), json.dumps(results)))
    conn.commit()
    conn.close()
