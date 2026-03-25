from django.contrib import admin
from .models import Asset


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'current_price_usd', 'last_price_update')
    list_filter = ('type',)
    search_fields = ('id', 'name')
    ordering = ('type', 'id')
