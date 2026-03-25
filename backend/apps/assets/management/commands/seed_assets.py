"""
Management command para poblar el catálogo inicial de activos.

Uso: docker compose run --rm backend python manage.py seed_assets

Usa update_or_create para ser idempotente (se puede correr N veces sin duplicar datos).
"""
from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.assets.models import Asset

INITIAL_ASSETS = [
    {
        'id': 'USD',
        'name': 'US Dollar',
        'type': Asset.AssetType.FIAT,
        'current_price_usd': Decimal('1'),
    },
    {
        'id': 'BOB',
        'name': 'Boliviano',
        'type': Asset.AssetType.FIAT,
        'current_price_usd': Decimal('0.14493'),
    },
    {
        'id': 'EUR',
        'name': 'Euro',
        'type': Asset.AssetType.FIAT,
        'current_price_usd': Decimal('1.08'),
    },
    {
        'id': 'BTC',
        'name': 'Bitcoin',
        'type': Asset.AssetType.CRYPTO,
        'current_price_usd': Decimal('0'),
    },
    {
        'id': 'ETH',
        'name': 'Ethereum',
        'type': Asset.AssetType.CRYPTO,
        'current_price_usd': Decimal('0'),
    },
    {
        'id': 'USDT',
        'name': 'Tether',
        'type': Asset.AssetType.CRYPTO,
        'current_price_usd': Decimal('1'),
    },
]


class Command(BaseCommand):
    help = 'Puebla la base de datos con el catálogo inicial de activos (fiat y cripto).'

    def handle(self, *args, **kwargs) -> None:
        for asset_data in INITIAL_ASSETS:
            asset_id = asset_data.pop('id')
            _, created = Asset.objects.update_or_create(
                id=asset_id,
                defaults=asset_data,
            )
            action = 'Creado' if created else 'Actualizado'
            self.stdout.write(f'  {action}: {asset_id}')

        self.stdout.write(self.style.SUCCESS('\nAssets iniciales cargados correctamente.'))
