from sqlalchemy.orm import relationship
from config import get_db

db = get_db()

follow_table = db.Table('followers',
            db.Column('following_id', db.Integer, db.ForeignKey('user.id')),
            db.Column('follower_id', db.Integer, db.ForeignKey('user.id'))
            )


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    full_name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(30), nullable=False)
    description = db.Column(db.String(250), nullable=True)
    confirmed_email = db.Column(db.Boolean)
    admin = db.Column(db.Boolean)
    registration_date = db.Column(db.Date)
    following = relationship('User',
                                secondary=follow_table,
                                primaryjoin=(follow_table.c.following_id == id),
                                secondaryjoin=(follow_table.c.follower_id == id),
                                backref=db.backref('followers', lazy='dynamic'),
                                lazy='dynamic')

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
            'registrationDate': dump_datetime(self.registration_date),
            'following': list(map(lambda x: x[1], db.session.execute(self.following).fetchall()))

        }


def dump_datetime(value):
    if value is None:
        return None
    return value.strftime("%m-%d-%Y")
