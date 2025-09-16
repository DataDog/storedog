from ddtrace import patch
import json_log_formatter
from ddtrace import tracer
import traceback
import logging
from models import Discount, DiscountType, db
from bootstrap import create_app
from sqlalchemy.orm import joinedload
from flask_cors import CORS
from flask import request as flask_request
from flask import Flask, Response, jsonify
import words
import requests
import random
import time
import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

patch(logging=True)

formatter = json_log_formatter.VerboseJSONFormatter()
json_handler = logging.StreamHandler(sys.stdout)
json_handler.setFormatter(formatter)
logger = logging.getLogger('werkzeug')
logger.addHandler(json_handler)
logger.setLevel(logging.DEBUG)

# get the BROKEN_DISCOUNTS environment variable, if it exists
BROKEN_DISCOUNTS = os.getenv("BROKEN_DISCOUNTS")

app = create_app()
CORS(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Add filter to remove color-encoding from logs e.g. "[37mGET / HTTP/1.1 [0m" 200 -


class NoEscape(logging.Filter):
    def __init__(self):
        self.regex = re.compile(r'(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]')

    def strip_esc(self, s):
        try:  # string-like
            return self.regex.sub('', s)
        except:  # non-string-like
            return s

    def filter(self, record):
        record.msg = self.strip_esc(record.msg)
        if type(record.args) is tuple:
            record.args = tuple(map(self.strip_esc, record.args))
        return 1


remove_color_filter = NoEscape()
logger.addFilter(remove_color_filter)


@app.route('/')
def hello():
    return Response({'Hello from Discounts!': 'world'}, mimetype='application/json')


@app.route('/discount', methods=['GET', 'POST'])
def status():
    if flask_request.method == 'GET':

        try:
            discounts = Discount.query.all()
            logger.info(f"Discounts available: {len(discounts)}")

            influencer_count = 0
            for discount in discounts:
                if discount.discount_type.influencer:
                    influencer_count += 1
            logger.info(
                f"Total of {influencer_count} influencer specific discounts as of this request")

            return jsonify([b.serialize() for b in discounts])

        except:
            logger.error("An error occurred while getting discounts.")
            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

    elif flask_request.method == 'POST':

        try:
            # create a new discount with random name and value
            discounts_count = len(Discount.query.all())
            new_discount_type = DiscountType('Random Savings',
                                             'price * .9',
                                             None)
            new_discount = Discount('Discount ' + str(discounts_count + 1),
                                    words.get_random(random.randint(2, 4)),
                                    random.randint(10, 500),
                                    new_discount_type)
            logger.info(f"Adding discount {new_discount}")
            db.session.add(new_discount)
            db.session.commit()
            discounts = Discount.query.all()

            return jsonify([b.serialize() for b in discounts])

        except:
            logger.error("An error occurred while creating a new discount.")
            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

    else:
        err = jsonify({'error': 'Invalid request method'})
        err.status_code = 405
        return err


@app.route("/discount-code", methods=["GET"])
def getDiscount():
    if flask_request.method == "GET":
        try:
            # Get the discount code from the query string
            discount_code = flask_request.args.get("discount_code")
            # Log the discount code
            logger.info(f"Discount code: {discount_code}")
            discount = Discount.query.filter_by(code=discount_code).first()

            # Broken discounts feature flag is ENABLED, randomly error out
            if BROKEN_DISCOUNTS == "ENABLED" and random.choice([True, False]):
                raise Exception("Discount service error")

            if discount:
                response = discount.serialize()
                response.update({"status": 1})
                return jsonify(response)
            else:
                response = jsonify({"error": "Discount not found", "status": 0})
                return response
        except Exception as e:
            # Log the error details with exception type, message, and stack trace
            logger.error(
                "An error occurred while getting discount.",
                exc_info=True  # Includes the stack trace in the log
            )
            # Optionally capture the stack trace separately if needed
            stack_trace = traceback.format_exc()
            logger.debug(f"Stack trace: {stack_trace}")

            # Add error details to the response for debugging
            err = jsonify({
                'error': str(e),
                'message': 'Internal Server Error',
                'stack_trace': stack_trace  # Optional: Include only for debugging purposes
            })
            err.status_code = 500
            return err
    else:
        err = jsonify({"error": "Invalid request method"})
        err.status_code = 405
        return err
