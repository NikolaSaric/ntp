from flask import jsonify, make_response
from sqlalchemy.exc import SQLAlchemyError
from data import User
import jwt


def get_following(request, db, key):
    token = request.headers.get('jwt')

    decoded_jwt = jwt.decode(token, key)

    user = User.query.filter_by(username=decoded_jwt.get('username')).first()

    if not user:
        return make_response('User not logged in', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    return jsonify(list(map(lambda x: x[1], db.session.execute(user.following).fetchall())))


def follow_user(request, db, key):
    data = request.get_json()
    token = request.headers.get('jwt')

    decoded_jwt = jwt.decode(token, key)

    user = User.query.filter_by(username=decoded_jwt.get('username')).first()

    if not user:
        return make_response('User not logged in', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    follow_user = User.query.filter_by(username=data['username']).first()

    if not follow_user:
        return make_response('Username not found', 404, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    if data['follow']:
        user.following.append(follow_user)
    elif not data['follow']:
        user.following.remove(follow_user)
    else:
        return make_response('Bad request', 400, {'WWW-Authenticate': 'Basic realm="Login required!"'})

    try:
        db.session.commit()

    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        return error

    if data['follow']:
        return make_response('Started following ' + data['username'], 200)
    elif not data['follow']:
        return make_response('Unfollowed ' + data['username'], 200)
