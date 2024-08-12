import base64
import os

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file, abort

import screen.screen_controller as screen_controller

app = Flask(__name__)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
image_path = os.path.join(ROOT_DIR, "data/current_image.png")
text_path = os.path.join(ROOT_DIR, "data/current_text.txt")


@app.route('/')
def index():
    return render_template("index.html")


@app.route('/upload-image', methods=['POST'])
def upload_image():
    try:
        data = request.get_json()
        screen_controller.image_rotation = int(data['rotation'])

        image_data = data['image'].replace('data:image/png;base64,', '')
        image_data = base64.b64decode(image_data)

        with open(image_path, "wb") as file:
            file.write(image_data)

        screen_controller.display_image(image_path)

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/clear-screen', methods=['POST'])
def clear_screen():
    screen_controller.clear()
    return redirect(url_for("index"))


@app.route('/image')
def get_image():
    if os.path.exists(image_path):
        return send_file(image_path)
    abort(404)


@app.route('/save-text', methods=['POST'])
def save_text():
    try:
        data = request.get_json()
        rows = data['rows']
        font_size = data['fontSize']
        separate = data['separate']
        distribute = data['distribute']
        rotation = data['rotation']
        content = data['content']

        with open(text_path, "w") as file:
            file.write(rotation + "\n")
            file.write(rows + "\n")
            file.write(font_size + "\n")
            file.write(str(separate) + "\n")
            file.write(str(distribute) + "\n")
            for element in content:
                file.write(element + "\n")

        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/get-text')
def get_text():
    try:
        with open(text_path, "r") as file:
            rotation = file.readline().replace("\n", "")
            rowCount = file.readline().replace("\n", "")
            fontSize = file.readline().replace("\n", "")
            separate = file.readline().replace("\n", "")
            distribute = file.readline().replace("\n", "")
            content = file.readlines()

        return jsonify({
            'rows': int(rowCount),
            'fontSize': int(fontSize),
            'separate': False if separate == "False" else True,
            'distribute': False if distribute == "False" else True,
            'rotation': rotation,
            'content': content
        }), 200

    except IOError:
        abort(404)


if __name__ == "__main__":
    if not os.path.isdir(os.path.dirname(image_path)):
        os.mkdir(os.path.dirname(image_path))

    if os.path.exists(text_path):
        with open(text_path, "r") as file:
            screen_controller.image_rotation = int(file.readline().replace("\n", ""))

    screen_controller.enable_automatic_refresh(image_path)
    app.run(debug=False, host='0.0.0.0')
