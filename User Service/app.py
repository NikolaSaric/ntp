from flask import request
from config import get_db, get_app
import user
import auth
import following

app = get_app()
db = get_db()


@app.route('/auth/register', methods=['POST'])
def register():
    return auth.register(request, db)


@app.route('/auth/log-in', methods=['GET'])
def log_in():
    return auth.log_in(request, db, app.config['SECRET_KEY'])


@app.route('/user/change-password', methods=['POST'])
def change_password():
    return user.change_password(request, db, app.config['SECRET_KEY'])


@app.route('/user', methods=['GET'])
def get_user():
    return user.get_user(request)


@app.route('/user/follow', methods=['GET'])
def get_following():
    return following.get_following(request, db, app.config['SECRET_KEY'])


@app.route('/user/follow', methods=['PUT'])
def follow_user():
    return following.follow_user(request, db, app.config['SECRET_KEY'])


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8080)