from django.conf import settings
from django.db import models

from apps.items.models import Item


class ItemRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="requests")
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="item_requests",
    )
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["item", "requester"],
                name="unique_request_per_user_item",
            )
        ]

    def __str__(self):
        return f"{self.requester} → {self.item.title} ({self.status})"
