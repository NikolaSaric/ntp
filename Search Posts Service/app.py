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


@app.route('/post/user-posts', methods=['GET'])
def get_user_posts():
    page = int(request.headers.get('page'))
    per_page = int(request.headers.get('perPage'))
    token = request.headers.get('jwt')

    decoded_jwt = jwt.decode(token, app.config['SECRET_KEY'])

    return dumps(list(mongo.db.post.find({"username": decoded_jwt.get("username")})
                      .skip(page * per_page).limit(per_page).sort("_id", -1)))


@app.route('/post', methods=['GET'])
def get_posts_by_search_data():
    page = int(request.headers.get('page'))
    per_page = int(request.headers.get('perPage'))
    search_data = {}

    category = request.args.get('category', None)
    if category is not None and category != '':
        search_data['category'] = category

    type = request.args.get('type', None)
    if type is not None and type != '':
        search_data['type'] = type

    title = request.args.get('title', None)
    if title is not None and title != '':
        search_data['title'] = title

    username = request.args.get('username', None)
    if username is not None and username != '':
        search_data['username'] = username

    following = request.args.get('following', False)

    if following == 'true' and (username is None or username == ''):
        following_list = request.args.get('followingList', [])
        if following_list:
            make_list = following_list.split(',')
            search_data['username'] = {'$in': make_list}



    return dumps(list(mongo.db.post.find(search_data).skip(page * per_page).limit(per_page).sort("_id", -1)))


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8082)
