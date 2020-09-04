from flask import jsonify, make_response
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash, check_password_hash
from data import User
import jwt


def get_user(request):
    username = request.args.get('username', None)
    if username is None or username == '':
        return make_response('Username not found', 404)

    user = User.query.filter_by(username=username).first()

    return jsonify(user.serialize)


def change_password(request, db, key):
    data = request.get_json()
    token = request.headers.get('jwt')

    decoded_jwt = jwt.decode(token, key)

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
