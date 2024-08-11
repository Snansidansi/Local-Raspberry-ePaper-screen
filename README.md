# Project Overview
This project is a local web server build with Flask to control the display content of a 1.54-inch e-Paper screen using a Raspberry Pi 3. The e-Paper screen can optionally be housed in a 3D-printed fridge mount with a magnet.
# Requirements
- 1.54-inch e-Paper screen (the screen used in this project is from [Waveshare](https://www.waveshare.com/product/1.54inch-e-paper-module.htm))
- Raspberry Pi 3 (other models should also work, but the pin-out may vary)
## Optional
- 3D-printer
- Round magnet (maximum diameter: 32mm; optimal height: 6mm)
# Setup
## Pinout for the Waveshare 1.54-inch e-Paper Screen
| e-Paper | Raspberry Pi 3 |
| :------ | :------------: |
| VCC | 3.3V |
| GND | GND |
| DIN | GPIO 10 (MOSI) |
| CLK | GPIO 11 (SCLK) |
| CS | GPIO 8 (CE0) |
| DC | GPIO 25 |
| RST | GPIO 17 |
| BUSY | GPIO 24 |

([Source](https://www.waveshare.com/wiki/1.54inch_e-Paper_Module_Manual#Hardware_Connection))
## Raspberry Pi Setup
Setup the Raspberry Pi according to the [Waveshare manual](https://www.waveshare.com/wiki/1.54inch_e-Paper_Module_Manual#Working_With_Raspberry_Pi):
1. Follow the steps in the [Enable SPI Interface](https://www.waveshare.com/wiki/1.54inch_e-Paper_Module_Manual#Enable_SPI_Interface) section.
2. Follow the steps in the [Python](https://www.waveshare.com/wiki/1.54inch_e-Paper_Module_Manual#Python) section.
## Optional Fridge Mount
1. Print the fridge mount from the [media branch](../media/3d-stl-file).
2. Glue the magnet into the round mount hole.
3. Place the e-Paper screen into the mount.
## Web server
1. Clone the repository on the Raspberry Pi.
2. Install the pip-packages from the requirements.txt.
3. Run the app.py file in the src directory.
# Demo Images
## Web server
<img src="../media/images/website.png?raw=true" width="500">

## Screen in Fridge Mount
<img src="../media/images/Screen fridge mount.jpg?raw=true" width="500">
