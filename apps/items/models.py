from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Item(models.Model):
    class Condition(models.TextChoices):
        NEW = "new", "New"
        GOOD = "good", "Good"
        FAIR = "fair", "Fair"
        POOR = "poor", "Poor"

    class ListingType(models.TextChoices):
        FREE = "free", "Free"
        EXCHANGE = "exchange", "Exchange"
        SALE = "sale", "Sale"

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        REQUESTED = "requested", "Requested"
        GIVEN = "given", "Given Out"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="items",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="items"
    )
    condition = models.CharField(max_length=10, choices=Condition.choices)
    location = models.CharField(max_length=120)
    listing_type = models.CharField(max_length=10, choices=ListingType.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.AVAILABLE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "listing_type"]),
            models.Index(fields=["location"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return self.title


class ItemImage(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="items/")
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "created_at"]

    def __str__(self):
        return f"Image for {self.item.title}"


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites",
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.CASCADE,
        related_name="favorited_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "item"],
                name="unique_user_item_favorite",
            )
        ]

    def __str__(self):
        return f"{self.user} saved {self.item}"
