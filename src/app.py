import base64
import os

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file, abort

import screen.screen_controller as screen_controller

app = Flask(__name__)
image_path = "data/current_image.png"
text_path = "data/current_text.txt"

@app.route('/')
def index():
    return render_template("index.html")


@app.route('/upload-image', methods=['POST'])
def upload_image():
    try:
        data = request.get_json()
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
    os.remove(image_path)

    if os.path.exists(image_path):
        os.remove(image_path)
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
        content = data['content']

        with open(text_path, "w") as file:
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
            'content': content
        }), 200

    except IOError:
        abort(404)


if __name__ == "__main__":
    screen_controller.enable_automatic_refresh(image_path)
    if not os.path.isdir("data"):
        os.mkdir("data")

    app.run(debug=False, host='0.0.0.0')
