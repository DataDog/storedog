from flask import jsonify
from flask_cors import CORS
from bootstrap import create_app
from models import db
import random
import os

DB_USERNAME = os.environ['POSTGRES_USER']
DB_PASSWORD = os.environ['POSTGRES_PASSWORD']
DB_HOST = os.environ['POSTGRES_HOST']

DB_URL = 'postgresql://' + \
    DB_USERNAME + ':' + DB_PASSWORD + '@' + DB_HOST + '/' + DB_USERNAME

app = create_app()
app.config.update(
    DEBUG=True,
    SECRET_KEY="secret_sauce",
)

CORS(app)
engine = db.create_engine(DB_URL)

@app.route("/get-item", methods=["GET"])
def product_ticker():
    query = db.text(f'SELECT * FROM items WHERE order_count::int > {random.randint(1, 7000)};')
    app.logger.info(engine)
    try: 
        app.logger.info('Connecting to db')
        with engine.begin() as conn:
            results = conn.execute(query).fetchall()
            if results:
                app.logger.info('Results found, parsing single item')
                result = random.choice(results)
                item_response = {
                    'id': result.id,
                    'description': result.description,
                    'last_hour': result.last_hour,
                    'order_count': result.order_count,
                    'image_url': result.image_url
                }
                return jsonify(item_response)
    except:
        app.logger.error("An error occurred while getting items.")
        err = jsonify({'error': 'Internal Server Error'})
        err.status_code = 500
        return err

if __name__ == "__main__":
    app.run(debug=True)
