from flask import Flask
from models import Items, Preorder_Items, db
from faker import Faker
import random
import os

fake = Faker()
DB_USERNAME = os.environ['POSTGRES_USER']
DB_PASSWORD = os.environ['POSTGRES_PASSWORD']
DB_HOST = os.environ['POSTGRES_HOST']


def create_app():
    """Create a Flask application"""
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://' + \
        DB_USERNAME + ':' + DB_PASSWORD + '@' + DB_HOST + '/' + DB_USERNAME
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    initialize_database(app, db)
    return app


def initialize_database(app, db):
    """Drop and restore database in a consistent state"""
    app.logger.info('Running DB Init for DBM')
    with app.app_context():
        db.drop_all()
        db.create_all()
        for i in range(30000):
            newItem = Items(
                fake.sentence(),
                random.randint(1, 7000),
                fake.image_url(),
                random.randint(1, 10)
            )
            db.session.add(newItem)
            i+1
        for i in range(10000):
            newItem = Preorder_Items(
                fake.sentence(),
                random.randint(1, 7000),
                fake.image_url(),
                random.randint(1, 10),
                bool(random.getrandbits(1))
            )
            db.session.add(newItem)
            i+1
        db.session.commit()