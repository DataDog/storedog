import json_log_formatter
import traceback
import logging
from models import Discount, DiscountType, db
from bootstrap import create_app
from flask_cors import CORS
from flask import request as flask_request
from flask import Flask, Response, jsonify
from opentelemetry import metrics, trace
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import SERVICE_NAME, SERVICE_VERSION, Resource
import words
import requests
import random
import time
import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

formatter = json_log_formatter.VerboseJSONFormatter()
json_handler = logging.StreamHandler(sys.stdout)
json_handler.setFormatter(formatter)
logger = logging.getLogger('discounts')
logger.addHandler(json_handler)
logger.setLevel(logging.DEBUG)
logger.propagate = False


def configure_metrics():
    provider = metrics.get_meter_provider()
    if provider.__class__.__name__ != "ProxyMeterProvider":
        return provider

    resource = Resource.create(
        {
            SERVICE_NAME: os.getenv("OTEL_SERVICE_NAME", "discounts"),
            SERVICE_VERSION: os.getenv("OTEL_SERVICE_VERSION", "1.0.0"),
        }
    )
    exporter = OTLPMetricExporter()
    reader = PeriodicExportingMetricReader(exporter)
    provider = MeterProvider(resource=resource, metric_readers=[reader])
    metrics.set_meter_provider(provider)
    return metrics.get_meter_provider()


metric_provider = configure_metrics()
meter = metrics.get_meter("discounts-service", "1.0.0")
discount_request_counter = meter.create_counter(
    "discounts.requests",
    description="Counts discount service requests.",
)
discount_error_counter = meter.create_counter(
    "discounts.errors",
    description="Counts discount service request failures.",
)
discount_result_histogram = meter.create_histogram(
    "discounts.result_count",
    description="Records the number of discounts returned per request.",
    unit="1",
)
discount_value_histogram = meter.create_histogram(
    "discounts.lookup_value",
    description="Records the value of discounts returned by code lookup.",
    unit="1",
)

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


def _trace_context():
    span = trace.get_current_span()
    span_context = span.get_span_context()
    if not span_context.is_valid:
        return {}

    return {
        "trace_id": format(span_context.trace_id, "032x"),
        "span_id": format(span_context.span_id, "016x"),
    }


def log_event(level, message, exc_info=False, **fields):
    payload = _trace_context()
    payload.update(fields)
    logger.log(level, message, exc_info=exc_info, extra=payload)


def record_request(endpoint, method, outcome, **attrs):
    attributes = {
        "endpoint": endpoint,
        "method": method,
        "outcome": outcome,
    }
    attributes.update(attrs)
    discount_request_counter.add(1, attributes)


def record_error(endpoint, method, error_type, **attrs):
    attributes = {
        "endpoint": endpoint,
        "method": method,
        "error.type": error_type,
    }
    attributes.update(attrs)
    discount_error_counter.add(1, attributes)


@app.route('/')
def hello():
    return Response({'Hello from Discounts!': 'world'}, mimetype='application/json')


@app.route('/discount', methods=['GET', 'POST'])
def status():
    if flask_request.method == 'GET':

        try:
            discounts = Discount.query.all()
            influencer_count = 0
            for discount in discounts:
                if discount.discount_type.influencer:
                    influencer_count += 1
            result_count = len(discounts)
            record_request("/discount", "GET", "success")
            discount_result_histogram.record(
                result_count,
                {
                    "endpoint": "/discount",
                    "method": "GET",
                },
            )
            log_event(
                logging.INFO,
                "discount list served",
                endpoint="/discount",
                method="GET",
                result_count=result_count,
                influencer_count=influencer_count,
            )

            return jsonify([b.serialize() for b in discounts])

        except Exception as exc:
            record_request("/discount", "GET", "error")
            record_error("/discount", "GET", type(exc).__name__)
            log_event(
                logging.ERROR,
                "discount list failed",
                endpoint="/discount",
                method="GET",
                error_type=type(exc).__name__,
                exc_info=True,
            )
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
            db.session.add(new_discount)
            db.session.commit()
            discounts = Discount.query.all()
            result_count = len(discounts)
            record_request("/discount", "POST", "success")
            discount_result_histogram.record(
                result_count,
                {
                    "endpoint": "/discount",
                    "method": "POST",
                },
            )
            log_event(
                logging.INFO,
                "discount created",
                endpoint="/discount",
                method="POST",
                discount_code=new_discount.code,
                discount_value=new_discount.value,
                result_count=result_count,
            )

            return jsonify([b.serialize() for b in discounts])

        except Exception as exc:
            record_request("/discount", "POST", "error")
            record_error("/discount", "POST", type(exc).__name__)
            log_event(
                logging.ERROR,
                "discount creation failed",
                endpoint="/discount",
                method="POST",
                error_type=type(exc).__name__,
                exc_info=True,
            )
            err = jsonify({'error': 'Internal Server Error'})
            err.status_code = 500
            return err

    else:
        record_request("/discount", flask_request.method, "invalid_method")
        err = jsonify({'error': 'Invalid request method'})
        err.status_code = 405
        return err


@app.route("/discount-code", methods=["GET"])
def getDiscount():
    if flask_request.method == "GET":
        try:
            # Get the discount code from the query string
            discount_code = flask_request.args.get("discount_code")
            discount = Discount.query.filter_by(code=discount_code).first()

            # Broken discounts feature flag is ENABLED, randomly error out
            if BROKEN_DISCOUNTS == "ENABLED" and random.choice([True, False]):
                raise Exception("Discount service error")

            if discount:
                response = discount.serialize()
                response.update({"status": 1})
                record_request("/discount-code", "GET", "hit")
                discount_value_histogram.record(
                    discount.value,
                    {
                        "endpoint": "/discount-code",
                        "discount_type": discount.discount_type.name,
                    },
                )
                log_event(
                    logging.INFO,
                    "discount lookup hit",
                    endpoint="/discount-code",
                    method="GET",
                    discount_code=discount_code,
                    discount_name=discount.name,
                    discount_type=discount.discount_type.name,
                    discount_value=discount.value,
                )
                return jsonify(response)
            else:
                record_request("/discount-code", "GET", "miss")
                log_event(
                    logging.WARNING,
                    "discount lookup miss",
                    endpoint="/discount-code",
                    method="GET",
                    discount_code=discount_code,
                )
                err = jsonify({"error": "Discount not found", "status": 0})
                err.status_code = 404
                return err
        except Exception as e:
            record_request("/discount-code", "GET", "error")
            record_error(
                "/discount-code",
                "GET",
                type(e).__name__,
                broken_discounts=BROKEN_DISCOUNTS == "ENABLED",
            )
            # Log the error details with exception type, message, and stack trace
            log_event(
                logging.ERROR,
                "discount lookup failed",
                endpoint="/discount-code",
                method="GET",
                discount_code=flask_request.args.get("discount_code"),
                error_type=type(e).__name__,
                broken_discounts=BROKEN_DISCOUNTS == "ENABLED",
                exc_info=True,
            )
            # Optionally capture the stack trace separately if needed
            stack_trace = traceback.format_exc()
            log_event(
                logging.DEBUG,
                "discount lookup stack trace",
                endpoint="/discount-code",
                method="GET",
                stack_trace=stack_trace,
            )

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
