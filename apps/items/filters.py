import django_filters

from .models import Item


class ItemFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    location = django_filters.CharFilter(lookup_expr="icontains")
    is_free = django_filters.BooleanFilter(method="filter_free")

    class Meta:
        model = Item
        fields = ("status", "listing_type", "condition")

    def filter_free(self, queryset, name, value):
        if value:
            return queryset.filter(listing_type=Item.ListingType.FREE)
        return queryset
