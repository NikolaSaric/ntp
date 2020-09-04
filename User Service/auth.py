from werkzeug.security import generate_password_hash, check_password_hash
from flask import jsonify, make_response
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timedelta
from data import User
import jwt


def register(request, db):
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

    return make_response('Successfully registered as: ' + new_user.username +
                         ' , please verify your email: ' + new_user.email, 200)


def log_in(request, db, key):
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
             'exp': datetime.utcnow() + timedelta(days=2),
             'following': list(map(lambda x: x[1], db.session.execute(user.following).fetchall()))},
            key)

        return jsonify({'token': token.decode('UTF-8')})

    return make_response('Username and password do not match', 401,
                         {'WWW-Authenticate': 'Basic realm="Login required!"'})