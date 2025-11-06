from dotenv import load_dotenv
import os
load_dotenv()

from flask import Flask
from database import Base, engine
from routes import user_bp, room_bp, booking_bp
from config import Config
from flask import jsonify
from utils import init_cache, logger, limiter
from flask_cors import CORS



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    Base.metadata.create_all(engine)
    init_cache(app)
    limiter.init_app(app)

    #blueprint registeration
    app.register_blueprint(user_bp,url_prefix='/api')
    app.register_blueprint(room_bp,url_prefix='/api')
    app.register_blueprint(booking_bp, url_prefix='/api')

  
    CORS(app)
   
    

    @app.errorhandler(Exception)
    def handle_general_error(err):
      return jsonify({"error": "Server Error", "message": str(err)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)


