import base64

from flask import Flask, render_template, request, jsonify, redirect, url_for

import screen.screen_controller as screen_controller

app = Flask(__name__)
image_path = "current_image.png"


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
        return jsonify({'success': False}), 500


@app.route('/clear-screen', methods=['POST'])
def clear_screen():
    screen_controller.clear()
    return redirect(url_for("index"))


if __name__ == "__main__":
    screen_controller.enable_automatic_refresh(image_path)
    app.run(debug=False, host='0.0.0.0')
