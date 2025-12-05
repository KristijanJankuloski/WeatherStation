import serial
import time
import os
import requests
import adafruit_dht
import board

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

dht = adafruit_dht.DHT11(board.D4)

print("Starting combined PM2.5 + DHT11 sensor reading...")
time.sleep(1)

while True:
    b = ser.read(1)
    pm1Value = None
    pm2Value = None
    pm10Value = None
    if b == b'\x42':            # Frame start
        buf = ser.read(LENG)
        if len(buf) == LENG and buf[0] == 0x4D:
            if check_value(buf):
                pm1Value = pm01(buf)
                pm2Value = pm25(buf)
                pm10Value = pm10(buf)
    
    temp = None
    hum = None
    retryReading = 0

    try:
        temp = dht.temperature
        hum = dht.humidity
    except:
        pass

    while temp is None and hum is None and retryReading < 3:
        time.sleep(1)
        try:
            temp = dht.temperature
            hum = dht.humidity
        except:
            pass
        retryReading += 1

    
    payload = {'pm1': pm1Value, 'pm25': pm2Value, 'pm10': pm10Value, 'temperature': temp, 'humidity': hum}
    try:
        response = requests.post(api_endpoint, json=payload)
    except:
        pass
    time.sleep(60)