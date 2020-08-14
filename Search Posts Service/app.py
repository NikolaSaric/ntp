from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.json_util import dumps
import jwt


app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'MusicFlow'
app.config["MONGO_URI"] = "mongodb://localhost:27017/ntp-post"
mongo = PyMongo(app)


@app.route('/post/api/', methods=['GET'])
def get_all():
    page = int(request.headers.get('page'))
    per_page = int(request.headers.get('perPage'))

    return dumps(list(mongo.db.post.find().skip(page * per_page).limit(per_page).sort("_id", -1)))


@app.route('/post/api/user-posts', methods=['GET'])
def get_user_posts():
    page = int(request.headers.get('page'))
    per_page = int(request.headers.get('perPage'))
    token = request.headers.get('jwt')

    decoded_jwt = jwt.decode(token, app.config['SECRET_KEY'])

    return dumps(list(mongo.db.post.find({"username": decoded_jwt.get("username")})
                      .skip(page * per_page).limit(per_page).sort("_id", -1)))


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8082)
