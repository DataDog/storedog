import requests
import random
import time
import sys
import re

from flask import Flask, Response, jsonify, send_from_directory
from flask import request as flask_request
from flask_cors import CORS

from bootstrap import create_app
from models import Advertisement, db

from ddtrace import patch;
# patch(logging=True)  
import logging
from ddtrace import tracer
import json_log_formatter

formatter = json_log_formatter.JSONFormatter()
json_handler = logging.StreamHandler(sys.stdout)
json_handler.setFormatter(formatter)
logger = logging.getLogger('werkzeug')
logger.addHandler(json_handler)
logger.setLevel(logging.DEBUG)

app = create_app()
CORS(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

## Add filter to remove color-encoding from logs e.g. "[37mGET / HTTP/1.1 [0m" 200 -
class NoEscape(logging.Filter):
    def __init__(self):
        self.regex = re.compile(r'(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]')
    def strip_esc(self, s):
        try: # string-like 
            return self.regex.sub('',s)
        except: # non-string-like
            return s
    def filter(self, record):
        record.msg = self.strip_esc(record.msg)
        if type(record.args) is tuple:
            record.args = tuple(map(self.strip_esc, record.args))
        return 1

remove_color_filter =NoEscape()
logger.addFilter(remove_color_filter)

@tracer.wrap()
@app.route('/')
def hello():
    logger.info("home url for ads called")
    return Response({'Hello from Advertisements!': 'world'}, mimetype='application/json')

@tracer.wrap()
@app.route('/banners/<path:banner>')
def banner_image(banner):
    logger.info(f"attempting to grab banner at {banner}")
    return send_from_directory('ads', banner)

@tracer.wrap()
@app.route('/weighted-banners/<float:weight>')
def weighted_image(weight):
    logger.info(f"attempting to grab banner weight of less than {weight}")
    advertisements = Advertisement.query.all()
    for ad in advertisements:
        if ad.weight < weight:
            return jsonify(ad.serialize())

@tracer.wrap()
@app.route('/ads', methods=['GET', 'POST'])
def status():
    if flask_request.method == 'GET':

        if 'X-Throw-Error' in flask_request.headers and flask_request.headers['X-Throw-Error'] == 'true':

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
              logger.info(f"Total advertisements available: {len(advertisements)}")
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
                                    random.randint(10,500))
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