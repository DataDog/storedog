import requests
import random
import time

from flask import Flask, Response, jsonify, send_from_directory
from flask import request as flask_request
from flask_cors import CORS

from bootstrap import create_app
from models import Advertisement, db

from ddtrace import patch; patch(logging=True)
import logging
from ddtrace import tracer

FORMAT = ('%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] '
          '[dd.service=%(dd.service)s dd.env=%(dd.env)s dd.version=%(dd.version)s dd.trace_id=%(dd.trace_id)s dd.span_id=%(dd.span_id)s] '
          '- %(message)s')
logging.basicConfig(format=FORMAT)
log = logging.getLogger(__name__)
log.level = logging.INFO

app = create_app()
CORS(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

@tracer.wrap()
@app.route('/')
def hello():
    log.info("home url for ads called")
    return Response({'Hello from Advertisements!': 'world'}, mimetype='application/json')

@tracer.wrap()
@app.route('/banners/<path:banner>')
def banner_image(banner):
    log.info(f"attempting to grab banner at {banner}")
    return send_from_directory('ads', banner)

@tracer.wrap()
@app.route('/weighted-banners/<float:weight>')
def weighted_image(weight):
    log.info(f"attempting to grab banner weight of less than {weight}")
    advertisements = Advertisement.query.all()
    for ad in advertisements:
        if ad.weight < weight:
            return jsonify(ad.serialize())

@tracer.wrap()
@app.route('/ads', methods=['GET', 'POST'])
def status():
    if flask_request.method == 'GET':

        try:
            advertisements = Advertisement.query.all()
            log.info(f"Total advertisements available: {len(advertisements)}")
            return jsonify([b.serialize() for b in advertisements])

        except:
            log.error("An error occurred while getting ad.")
            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

    elif flask_request.method == 'POST':

        try:
            # create a new advertisement with random name and value
            advertisements_count = len(Advertisement.query.all())
            new_advertisement = Advertisement('Advertisement ' + str(discounts_count + 1),
                                    '/',
                                    random.randint(10,500))
            log.info(f"Adding advertisement {new_advertisement}")
            db.session.add(new_advertisement)
            db.session.commit()
            advertisements = Advertisement.query.all()

            return jsonify([b.serialize() for b in advertisements])

        except:

            log.error("An error occurred while creating a new ad.")
            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

    else:
        err = jsonify({'error': 'Invalid request method'})
        err.status_code = 405
        return err