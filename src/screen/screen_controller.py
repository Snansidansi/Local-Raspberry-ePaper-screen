import epd1in54_V2
from PIL import Image
import os.path


def init() -> epd1in54_V2.EPD:
    epd = epd1in54_V2.EPD()
    epd.init(False)
    return epd


def display_image(path: str):
    if not os.path.isfile(path):
        return

    # Init
    epd = init()

    # Display image
    epd.display(epd.getbuffer(convert_image(path)))

    # Sleep display
    epd.sleep()


def convert_image(path: str) -> Image:
    loaded_image = Image.open(path)
    return loaded_image.convert('RGB')


def clear():
    epd = init()
    epd.sleep()

