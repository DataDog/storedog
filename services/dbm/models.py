from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Items(db.Model):
    __tablename__ = 'items'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(128))
    order_count = db.Column(db.String(64))
    last_hour = db.Column(db.String(64))
    image_url = db.Column(db.String(64))

    def __init__(self, description, order_count, image_url, last_hour):
        self.description = description
        self.order_count = order_count
        self.last_hour = last_hour
        self.image_url = image_url

    def serialize(self):
        return {
            'id': self.id,
            'description': self.description,
            'order_count': self.order_count,
            'last_hour': self.last_hour,
            'image_url': self.image_url
        }
class Preorder_Items(db.Model):
    __tablename__ = 'preorder_items'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(128))
    order_count = db.Column(db.String(64))
    last_hour = db.Column(db.String(64))
    image_url = db.Column(db.String(64))
    is_preorder = db.Column(db.Boolean())

    def __init__(self, description, order_count, image_url, last_hour, is_preorder):
        self.description = description
        self.order_count = order_count
        self.last_hour = last_hour
        self.image_url = image_url
        self.is_preorder = is_preorder

    def serialize(self):
        return {
            'id': self.id,
            'description': self.description,
            'order_count': self.order_count,
            'last_hour': self.last_hour,
            'image_url': self.image_url,
            'is_preorder': self.is_preorder
        }
