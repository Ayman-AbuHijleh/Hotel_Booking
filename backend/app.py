from flask import Flask
from database import Base, engine
from config import Config


def create_app():
    app = Flask(__name__)

   
    Base.metadata.create_all(engine)


    app.config.from_object(Config)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)


