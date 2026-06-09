from flask import Flask
from flask_cors import CORS
from config import PORT, DEBUG
from routes import api_blueprint

app = Flask(__name__)

# Enable wide-open CORS so your Node Express server can communicate with it
CORS(app)

# Register our organized blueprint layout
app.register_blueprint(api_blueprint)

if __name__ == '__main__':
    app.run(port=PORT, debug=DEBUG)