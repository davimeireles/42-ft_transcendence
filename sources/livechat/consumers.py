from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['room_name']
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print('Channel connected')
    async def receive(self, text_data):
        print(text_data)
        user = self.scope['user']
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'user': user.username
            }
        )
    # async def disconnect(self):
    async def chat_message(self, event):
    # This method will be triggered when group_send is called with 'type': 'chat_message'
        message = event['message']
        user = event['user']

    # Send the message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'user': user
        }))

