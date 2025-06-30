import json_log_formatter
import logging
import random
import sys
import re

from flask import Response, jsonify, send_from_directory
from flask import request as flask_request
from flask_cors import CORS

from bootstrap import create_app
from models import Advertisement, db

formatter = json_log_formatter.VerboseJSONFormatter()
json_handler = logging.StreamHandler(sys.stdout)
json_handler.setFormatter(formatter)
logger = logging.getLogger('werkzeug')
logger.addHandler(json_handler)
logger.setLevel(logging.DEBUG)

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
    logger.info("home url for ads called")
    return Response({'Hello from Advertisements!': 'world'}, mimetype='application/json')


@app.route('/banners/<path:banner>')
def banner_image(banner):
    logger.info(f"attempting to grab banner at {banner}")
    return send_from_directory('ads', banner)


@app.route('/weighted-banners/<float:weight>')
def weighted_image(weight):
    logger.info(f"attempting to grab banner weight of less than {weight}")
    advertisements = Advertisement.query.all()
    for ad in advertisements:
        if ad.weight < weight:
            return jsonify(ad.serialize())


@app.route('/ads', methods=['GET', 'POST'])
def status():
    if flask_request.method == 'GET':

        # determine if should throw error and save to variable
        throw_error = False
        if 'X-Throw-Error' in flask_request.headers and flask_request.headers['X-Throw-Error'] == 'true':
            throw_error = True

        # fetch error rate from header if present (0 - 1)
        error_rate = 1
        if 'X-Error-Rate' in flask_request.headers:
            error_rate = float(flask_request.headers['X-Error-Rate'])

        if throw_error and random.random() < error_rate:
            try:
                raise ValueError('something went wrong')
            except ValueError:
                logger.error('Request failed', exc_info=True)

            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

        else:

            try:
                advertisements = Advertisement.query.all()
                logger.info(
                    f"Total advertisements available: {len(advertisements)}")
                return jsonify([b.serialize() for b in advertisements])

            except:
                logger.error("An error occurred while getting ad.")
                err = jsonify({'error': 'Internal Server Error'})
                err.status_code = 500
                return err

    elif flask_request.method == 'POST':

        try:
            # create a new advertisement with random name and value
            advertisements_count = len(Advertisement.query.all())
            new_advertisement = Advertisement('Advertisement ' + str(advertisements_count + 1),
                                              '/',
                                              random.randint(10, 500))
            logger.info(f"Adding advertisement {new_advertisement}")
            db.session.add(new_advertisement)
            db.session.commit()
            advertisements = Advertisement.query.all()

            return jsonify([b.serialize() for b in advertisements])

        except:

            logger.error("An error occurred while creating a new ad.")
            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

    else:
        err = jsonify({'error': 'Invalid request method'})
        err.status_code = 405
        return err
