from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route('/api/hello', methods =['GET'])
def hello():
    return jsonify({"message": "hello from flask"})


@app.route('/api/data', methods=['POST'])
def recieve_data():
    data = request.json
    return jsonify({"recieved": data})

if __name__ == '__main__':
    app.run(debug=True, port=5000)