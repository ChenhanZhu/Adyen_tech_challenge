import logging
from flask import Flask, render_template, send_from_directory, request, abort
from main.request import create_sessions
from main.config import *
import json
def create_app():
    logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)
    logging.getLogger('werkzeug').setLevel(logging.ERROR)
    app = Flask('app')
    # Register 404 handler
    app.register_error_handler(404, page_not_found)

    # Routes:
    @app.route('/')
    def home():
        return render_template('home.html')

    @app.route('/checkout/<integration>')
    def checkout(integration):
        supported_methods=['dropin', 'card', 'ideal']
        if integration in supported_methods:
            return render_template('component.html', method=integration, client_key=adyen_client_key)

    @app.route('/api/sessions', methods=['POST'])
    def sessions():
        host_url = request.host_url
        print(host_url)
        return create_sessions(host_url)

    @app.route('/result/success', methods=['GET'])
    def checkout_success():
        return render_template('checkout-success.html')

    @app.route('/result/failed', methods=['GET'])
    def checkout_failure():
        return render_template('checkout-failed.html')


    @app.route('/redirect', methods=['POST', 'GET'])
    def redirect():

        return render_template('component.html', method=None, client_key=adyen_client_key)

    # Process incoming webhook notifications
    @app.route('/api/webhooks/notifications', methods=['POST'])
    def webhook_notifications():
        notifications = request.json['notificationItems']
        notification = notifications[0]
        return '', 202


    return app


#  Update your order management system
def update_system(notification):
    # write data in to mongodb
    updated_data = json.dumps(notification)

def page_not_found(error):
    return render_template('error.html'), 404


if __name__ == '__main__':
    web_app = create_app()

    logging.info(f"Running on http://localhost:{port}")
    web_app.run(debug=True, port=port, host='0.0.0.0')


