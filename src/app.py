import base64

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html")

@app.route('/upload-image', methods=['POST'])
def upload_image():
    try:
        data = request.get_json()
        image_data = data['image'].replace('data:image/png;base64,', '')
        image_data = base64.b64decode(image_data)

        with open("current_image.png", "wb") as file:
            file.write(image_data)

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False}), 500


if __name__ == "__main__":
    app.run(debug=True)
