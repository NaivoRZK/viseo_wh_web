import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard_to_guess_secret'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt_hard_to_guess_secret'
    ODOO_URL = os.environ.get('ODOO_URL') or 'http://localhost:8069'
    ODOO_DB = os.environ.get('ODOO_DB') or 'odoo_db'
    ODOO_SERVICE_USER = os.environ.get('ODOO_SERVICE_USER') or 'admin'
    ODOO_SERVICE_PASSWORD = os.environ.get('ODOO_SERVICE_PASSWORD') or 'admin'
    JWT_ACCESS_TOKEN_EXPIRES = 15 * 60
    JWT_REFRESH_TOKEN_EXPIRES = 30 * 24 * 60 * 60
    JWT_TOKEN_LOCATION = ['json', 'cookies']
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_REFRESH_JSON_ENABLE = True
