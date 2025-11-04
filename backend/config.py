import os

class Config:
    DEBUG = True
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_secret_key')
    DATABASE_URI = os.environ.get('DATABASE_URI', 'sqlite:///default.db')