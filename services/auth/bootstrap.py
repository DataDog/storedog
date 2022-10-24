from flask import Flask
from models import Users, db

import os
DB_USERNAME = os.environ['POSTGRES_USER']
DB_PASSWORD = os.environ['POSTGRES_PASSWORD']
DB_HOST = os.environ['POSTGRES_HOST']


def create_app():
    """Create a Flask application"""
    app = Flask(__name__)
    #app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://' + DB_USERNAME + ':' + DB_PASSWORD + '@' + DB_HOST + '/' + DB_USERNAME
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    initialize_database(app, db)
    return app


def initialize_database(app, db):
    """Drop and restore database in a consistent state"""
    app.logger.info('Running DB Init')
    with app.app_context():
        db.drop_all()
        db.create_all()
        first_user = Users('devin.ford@datadoghq.com', 'test123')
        second_user = Users('fake@notrealemail.com', 'fake123')
        db.session.add(first_user)
        db.session.add(second_user)
        db.session.commit()
