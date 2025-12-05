import serial
import time
import os
import requests

LENG = 31

def check_value(buf):
    s = sum(buf[:-2]) + 0x42
    checksum = (buf[-2] << 8) + buf[-1]
    return s == checksum

def pm01(buf): return (buf[3] << 8) + buf[4]
def pm25(buf): return (buf[5] << 8) + buf[6]
def pm10(buf): return (buf[7] << 8) + buf[8]

ser = serial.Serial(
    port="/dev/serial0",
    baudrate=9600,
    timeout=1
)

api_endpoint = os.getenv('WEATHER_API_ENDPOINT')

while True:
    b = ser.read(1)
    if b == b'\x42':            # Frame start
        buf = ser.read(LENG)
        if len(buf) == LENG and buf[0] == 0x4D:
            if check_value(buf):
                payload = {'pm1': pm01(buf), 'pm25': pm25(buf), 'pm10': pm10(buf)}
                response = requests.post(api_endpoint, json=payload)
    time.sleep(5)