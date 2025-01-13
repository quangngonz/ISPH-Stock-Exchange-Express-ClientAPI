import socketio
import time

sio = socketio.Client()

@sio.event
def connect():
    print('Connection established')

@sio.event
def disconnect():
    print('Disconnected from server')

@sio.event
def stockUpdate(data):
    print('Received stock update:', data)

@sio.event
def stockUpdateError(data):
    print('Error:', data)

def main():
    try:
        sio.connect('ws://localhost:3000', socketio_path='/api/socket/')
        print('Trying to connect, waiting...')
        time.sleep(5)  # Wait to see if connection is successful

        if sio.connected:
            print('Connected, now waiting for stock updates...')
            sio.wait() # Keep the script running to receive events
        else:
            print('Failed to connect within the timeout period.')

    except socketio.exceptions.ConnectionError as e:
        print(f'Connection failed: {e}')
    except Exception as e:
        print("An error occurred:", e)
    finally:
        if sio.connected:
            sio.disconnect()

if __name__ == '__main__':
    main()
