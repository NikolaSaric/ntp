from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import json

app = Flask(__name__)

cors = CORS(app)

app.config['SECRET_KEY'] = 'MusicFlow'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:root@127.0.0.1:3306/ntp'

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    full_name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    confirmed_email = db.Column(db.Boolean)
    admin = db.Column(db.Boolean)
    registration_date = db.Column(db.Date)

    @property
    def serialize(self):
        """Return object data in easily serializable format"""
        return {
            'id': self.id,
            'username': self.username,
            'fullName': self.full_name,
            'email': self.email,
            'description': self.description,
            'admin': self.admin,
            'registrationDate': dump_datetime(self.registration_date)
        }


def dump_datetime(value):
    if value is None:
        return None
    return value.strftime("%m-%d-%Y")


@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    hashed_password = generate_password_hash(data['password'], method='SHA256')

    new_user = User(username=data['username'], full_name=data['full_name'], password=hashed_password,
                    email=data['email'], description=data['description'], confirmed_email=False,
                    admin=False, registration_date=datetime.now())
    db.session.add(new_user)

    try:
        db.session.commit()

    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        return error

    return 'Successfully registered as: ' + new_user.username + ' , please verify your email: ' + new_user.email


@app.route('/auth/log-in', methods=['GET'])
def log_in():
    auth = request.authorization

    if not auth or not auth.username or not auth.password:
        return make_response('Missing username or password', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    user = User.query.filter_by(username=auth.username).first()

    if not user:
        return make_response('Not existing username', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    if check_password_hash(user.password, auth.password):
        token = jwt.encode(
            {'username': user.username, 'full_name': user.full_name, 'email': user.email,
             'description': user.description, 'admin': user.admin,
             'registration_date': str(user.registration_date),
             'exp': datetime.utcnow() + timedelta(days=2)},
            app.config['SECRET_KEY'])

        return jsonify({'token': token.decode('UTF-8')})

    return make_response('Username and password do not match', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})


@app.route('/user/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    token = request.headers.get('jwt')

    decoded_jwt = jwt.decode(token, app.config['SECRET_KEY'])

    if data['newPassword'] != data['repeatedPassword']:
        return make_response('New password does not much repeated password', 401)

    user = User.query.filter_by(username=decoded_jwt.get('username')).first()

    if not user:
        return make_response('Not existing username', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    if check_password_hash(user.password, data['oldPassword']):
        user.password = generate_password_hash(data['newPassword'], method='SHA256')

        try:
            db.session.commit()

        except SQLAlchemyError as e:
            error = str(e.__dict__['orig'])
            return error

        return 'Successfully changed password'

    return make_response('Username and password do not match', 401,
                         {'WWW-Authenticate': 'Basic realm="Login required!"'})


@app.route('/user', methods=['GET'])
def get_user():
    username = request.args.get('username', None)
    if username is None or username == '':
        return make_response('Username not found', 404)



    user = User.query.filter_by(username=username).first()

    return jsonify(user.serialize)


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8080)
