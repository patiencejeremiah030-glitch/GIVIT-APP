from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.items.models import Category

CATEGORIES = [
    "Electronics",
    "Furniture",
    "Books",
    "Clothes",
    "Kitchen",
    "Others",
]


class Command(BaseCommand):
    help = "Seed default item categories"

    def handle(self, *args, **options):
        for name in CATEGORIES:
            Category.objects.get_or_create(
                name=name,
                defaults={"slug": slugify(name)},
            )
        self.stdout.write(self.style.SUCCESS("Categories seeded successfully."))
