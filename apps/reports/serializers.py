from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.items.models import Item

from .models import Report

User = get_user_model()


class ReportCreateSerializer(serializers.ModelSerializer):
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Report
        fields = ("report_type", "reason", "object_id")

    def validate(self, attrs):
        report_type = attrs["report_type"]
        object_id = attrs["object_id"]
        if report_type == Report.ReportType.USER:
            if not User.objects.filter(pk=object_id).exists():
                raise serializers.ValidationError(
                    {"object_id": "User not found."}
                )
            content_type = ContentType.objects.get_for_model(User)
        elif report_type == Report.ReportType.ITEM:
            if not Item.objects.filter(pk=object_id).exists():
                raise serializers.ValidationError(
                    {"object_id": "Item not found."}
                )
            content_type = ContentType.objects.get_for_model(Item)
        else:
            raise serializers.ValidationError(
                {"report_type": "Invalid report type."}
            )
        attrs["content_type"] = content_type
        return attrs

    def create(self, validated_data):
        object_id = validated_data.pop("object_id")
        return Report.objects.create(
            reporter=self.context["request"].user,
            object_id=object_id,
            **validated_data,
        )


class ReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.CharField(source="reporter.email", read_only=True)

    class Meta:
        model = Report
        fields = (
            "id",
            "reporter",
            "reporter_email",
            "report_type",
            "reason",
            "status",
            "content_type",
            "object_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "reporter",
            "reporter_email",
            "content_type",
            "object_id",
            "created_at",
            "updated_at",
        )
