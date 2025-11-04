from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import Config


engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, echo=True)

Base = declarative_base()

Session = sessionmaker(bind=engine)





