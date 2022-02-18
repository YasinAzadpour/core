from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


class Message(models.Model):
    sender = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE)
    reciver = models.ForeignKey(User, related_name='reciver', on_delete=models.CASCADE)
    text = models.TextField(max_length=10000) #10K
    time = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f'{self.sender.pk}->{self.reciver.pk}'

    def to_json(self, absolute=False):
        data = {
            'id': self.pk,
            'text': self.text,
        }
        if absolute:
            data['sender_id'] = self.sender.id
            data['reciver_id'] = self.reciver.id
            data['time'] = self.time.isoformat()
        else:
            data['sender'] = self.sender
            data['reciver'] = self.reciver
            data['time'] = self.time
            
        return data

    @classmethod
    def get_conversation(cls, user_id_1, user_id_2):
        conversation = list(
            cls.objects.filter(
                Q(sender_id=user_id_1,reciver_id=user_id_2) | Q(sender_id=user_id_2,reciver_id=user_id_1)
                ).order_by("time").values()
            )
        return conversation
       