from flask import Flask
from models import Discount, DiscountType, Influencer, db

import random
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

DB_USERNAME = os.environ['POSTGRES_USER']
DB_PASSWORD = os.environ['POSTGRES_PASSWORD']
DB_HOST = os.environ['POSTGRES_HOST']

DISCOUNT_TYPE_TEMPLATES = [
    ("Preferred Customer Savings", "price * .90"),
    ("Weekend Savings", "price * .92"),
    ("Loyalty Reward", "price * .95"),
    ("Referral Incentive", "price * .93"),
    ("Seasonal Promotion", "price * .88"),
    ("Corporate Benefit", "price * .91"),
    ("Member Appreciation", "price * .89"),
]

DISCOUNT_NAME_TEMPLATES = [
    "Preferred Customer Credit",
    "Member Savings Offer",
    "Seasonal Shopping Credit",
    "Loyalty Pricing Benefit",
    "Referral Purchase Credit",
    "Weekend Rate Adjustment",
    "Corporate Appreciation Offer",
    "Customer Retention Credit",
]

DISCOUNT_CODE_TEMPLATES = [
    "PREFERRED10",
    "WEEKEND15",
    "MEMBER25",
    "REFERRAL12",
    "SPRING20",
    "CORPORATE18",
    "LOYALTY08",
    "REWARD30",
]

INFLUENCER_NAMES = [
    "Jordan Lee",
    "Taylor Brooks",
    "Casey Morgan",
    "Alex Parker",
    "Morgan Chen",
    "Avery Patel",
]


def build_catalog_discount(index):
    """Create a curated discount record with professional naming."""
    discountTypeName, discountQuery = DISCOUNT_TYPE_TEMPLATES[
        index % len(DISCOUNT_TYPE_TEMPLATES)
    ]
    discountName = DISCOUNT_NAME_TEMPLATES[index % len(DISCOUNT_NAME_TEMPLATES)]
    discountCode = f"{DISCOUNT_CODE_TEMPLATES[index % len(DISCOUNT_CODE_TEMPLATES)]}{index + 1:02d}"
    influencerName = INFLUENCER_NAMES[index % len(INFLUENCER_NAMES)]
    discountValue = float(random.choice([5, 10, 15, 20, 25, 30, 35]))

    discountType = DiscountType(
        discountTypeName,
        discountQuery,
        Influencer(influencerName),
    )
    discount = Discount(
        discountName,
        discountCode,
        discountValue,
        discountType,
    )
    return discount


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
    with app.app_context():
        db.drop_all()
        db.create_all()

        for i in range(100):
            db.session.add(build_catalog_discount(i))

        first_discount_type = DiscountType('Preferred Customer Savings',
                                           'price * .8',
                                           Influencer('Jordan Lee'))
        second_discount_type = DiscountType('Weekend Savings',
                                            'price * .9',
                                            None)
        third_discount_type = DiscountType('Loyalty Reward',
                                           'price * .95',
                                           None)
        first_discount = Discount('Preferred Customer Offer',
                                  'PREFERRED10',
                                  10.0,
                                  first_discount_type)

        second_discount = Discount('Weekend Promotional Rate',
                                   'WEEKEND15',
                                   15.0,
                                   second_discount_type)
        third_discount = Discount('Member Appreciation Credit',
                                  'MEMBER25',
                                  25.0,
                                  third_discount_type)
        db.session.add(first_discount)
        db.session.add(second_discount)
        db.session.add(third_discount)
        db.session.commit()
