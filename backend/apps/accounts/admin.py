from django.contrib import admin
from .models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'asset', 'balance', 'created_at')
    list_filter = ('asset',)
    search_fields = ('name', 'user__email')
    ordering = ('user', 'name')
