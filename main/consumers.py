import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from django.contrib.auth import get_user_model
from .models import Message


User = get_user_model()


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        if self.user.is_authenticated: 
            self.user_id = self.scope['url_route']['kwargs']['user_id']
            self.reciver = User.objects.get(pk=self.user_id)
            path = sorted([self.user.id, int(self.user_id)])
            self.chat_path = f'{path[0]}{path[1]}'
            # Join room group
            async_to_sync(self.channel_layer.group_add)(
                self.chat_path,
                self.channel_name
            )

            self.accept()


    def disconnect(self, status_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.chat_path,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text = json.loads(text_data)['text'].strip()
        new_message = Message(sender=self.user, reciver=self.reciver, text=text)
        new_message.save()
        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.chat_path, new_message.to_json(True) | {'type': 'chat_message'}
        )
        

    # Receive message from room group
    def chat_message(self, event):
        # Send message to WebSocket
        self.send(text_data=json.dumps(event))
