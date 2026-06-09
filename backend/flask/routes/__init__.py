from flask import Blueprint
from .embed.route import embed_blueprint # Imports the file we just made

# ⚙️ Define your root API wrapper
api_blueprint = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Mount your sub-blueprints directly onto the API shell
api_blueprint.register_blueprint(embed_blueprint, url_prefix='/ai')