from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

    jwt.init_app(app)

    from .auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/')

    return app
