from django.contrib import admin
from .models import Category, Transaction


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user')
    list_filter = ('type',)
    search_fields = ('name',)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('type', 'amount', 'fee_amount', 'user', 'account_origin', 'account_destination', 'timestamp')
    list_filter = ('type', 'category')
    search_fields = ('user__email', 'description')
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'
