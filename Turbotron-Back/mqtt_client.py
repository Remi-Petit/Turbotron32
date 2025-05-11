import paho.mqtt.client as mqtt
import json
import time
from websocket import create_connection, WebSocketConnectionClosedException

# Configuration du broker MQTT
MQTT_URL = '82.64.159.229'
MQTT_PORT = 1883
MQTT_TOPICS = ['esp32/track', 'esp32/sonar', 'esp32/light']

# Adresse WebSocket du ESP32
WS_URL = 'ws://192.168.0.50/ws'

# Fonction pour établir la connexion WebSocket avec des tentatives de reconnexion
def connect_websocket():
    while True:
        try:
            ws = create_connection(WS_URL)
            print("WebSocket connected")
            return ws
        except Exception as e:
            print(f"WebSocket connection failed: {e}. Retrying in 2 seconds...")
            time.sleep(2)

# Connexion WebSocket initiale
ws = connect_websocket()

# Callback quand la connexion au broker est établie
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    for topic in MQTT_TOPICS:
        client.subscribe(topic)

# Callback quand un message est reçu
def on_message(client, userdata, msg):

    global ws  # Utiliser la variable globale ws
    vitesse = 1000
    courbe_vitesse = 800  # Vitesse réduite pour les virages

    print(f"Message reçu : Topic: {msg.topic}, Message: {msg.payload.decode()}")
    if msg.topic == 'esp32/track':
        track_value = int(msg.payload.decode())
        if track_value == 0 or track_value == 7:
            command = {
                'cmd': 1,
                'data': [0, 0, 0, 0]  # Commande pour s'arrêter
            }
        elif track_value == 1 or track_value == 3:
            command = {
                'cmd': 1,
                'data': [0, 0, courbe_vitesse*1.5, courbe_vitesse*1.5]  # Commande pour aller à gauche
            }
        elif track_value == 4 or track_value == 6:
            command = {
                'cmd': 1,
                'data': [courbe_vitesse, courbe_vitesse, 0, 0]  # Commande pour aller à droite
            }
        elif track_value == 2 or track_value == 5:
            command = {
                'cmd': 1,
                'data': [vitesse*0.8, vitesse*0.8, vitesse*0.8, vitesse*0.8]  # Commande pour avancer
            }

        try:
            ws.send(json.dumps(command))
            print(f"Command sent to car: {command}")
        except (WebSocketConnectionClosedException, ConnectionResetError) as e:
            print(f"WebSocket connection lost ({e}). Reconnecting...")
            ws = connect_websocket()

# Créer une instance de client MQTT
client = mqtt.Client()

# Définir les callbacks
client.on_connect = on_connect
client.on_message = on_message

# Connecter au broker
client.connect(MQTT_URL, MQTT_PORT, 60)

# Boucle pour maintenir la connexion et traiter les messages
client.loop_forever()
