from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

CORS(app)

app.config['SECRET_KEY'] = 'MusicFlow'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:root@127.0.0.1:3306/ntp'

db = SQLAlchemy(app)


def get_app():
    return app


def get_db():
    return db
