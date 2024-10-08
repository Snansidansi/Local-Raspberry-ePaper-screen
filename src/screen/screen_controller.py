import threading
from time import sleep

from . import epd1in54_V2
from PIL import Image
import os.path

refreshing = False
image_rotation = 0
sleep_time = 2  # Refresh time of the e-Paper screen


def init() -> epd1in54_V2.EPD:
    epd = epd1in54_V2.EPD()
    epd.init(False)
    return epd


def display_image(path: str):
    if not os.path.isfile(path):
        clear()

    global refreshing
    while refreshing:
        sleep(sleep_time)

    # Init
    refreshing = True
    epd = init()

    # Display image
    epd.display(epd.getbuffer(convert_image(path).rotate(image_rotation)))

    # Sleep display
    epd.sleep()
    refreshing = False


def convert_image(path: str) -> Image:
    loaded_image = Image.open(path)
    return loaded_image.convert('RGB')


def clear():
    global refreshing
    while refreshing:
        sleep(sleep_time)

    refreshing = True
    epd = init()
    epd.Clear()
    epd.sleep()
    refreshing = False


def enable_automatic_refresh(path: str):
    threading.Thread(target=automatic_refresh, args=(path,)).start()


def automatic_refresh(path: str):
    global refreshing
    while True:
        sleep(60 * 60 * 6)  # Refresh every 6h (manufacturer recommendation: refresh once between 3 min and 24 hours

        while refreshing:
            sleep(sleep_time)

        display_image(path)
