from dotenv import load_dotenv
import os
load_dotenv()

from flask import Flask
from database import Base, engine
from routes import customer_bp
from config import Config
from flask import jsonify
from utils import init_cache



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    Base.metadata.create_all(engine)
    init_cache(app)

    #blueprint registeration
    app.register_blueprint(customer_bp,url_prefix='/api')
  

   


    @app.errorhandler(Exception)
    def handle_general_error(err):
      return jsonify({"error": "Server Error", "message": str(err)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)


