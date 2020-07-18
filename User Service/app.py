from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

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
            {'username': user.username, 'full_name': user.full_name, 'email': user.email, 'admin': user.admin,
             'registration_date': str(user.registration_date),
             'exp': datetime.utcnow() + timedelta(days=2)},
            app.config['SECRET_KEY'])

        return jsonify({'token': token.decode('UTF-8')})

    return make_response('Username and password do not match', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8080)
