"""Versioned deterministic 3:2 catalog/category request sequence."""
import json
from pathlib import Path
from urllib.parse import urlencode

INCLUDES = 'default_variant,images,primary_variant,taxons'

class Workload:
    def __init__(self, path):
        path = Path(path)
        self.profile = json.loads(path.read_text())
        self.catalog = json.loads((path.parent / self.profile['catalog']).read_text())
        if self.profile['version'] != 1 or self.catalog['version'] != 1:
            raise ValueError('unsupported manifest version')
        self.products = sorted(self.catalog['products'], key=lambda r: r['key'])
        self.categories = self.catalog['categories']
        if len(self.products) != self.catalog['counts']['products'] or not self.categories:
            raise ValueError('incomplete catalog')
        self.by_category = {c['key']: [p for p in self.products if p['category'] == c['key']] for c in self.categories}
        if any(not products for products in self.by_category.values()):
            raise ValueError('empty category')

    def request(self, index):
        block, slot = divmod(index, 5)
        if slot < 3:
            kind, ordinal = 'catalog', block * 3 + slot
            products, taxon = self.products, self.catalog['catalog_taxon_id']
        else:
            kind, ordinal = 'category', block * 2 + slot - 3
            category = self.categories[ordinal % len(self.categories)]
            products, taxon = self.by_category[category['key']], category['id']
            ordinal //= len(self.categories)
        page = ordinal % ((len(products) + 24) // 25) + 1
        expected = [p['id'] for p in products[(page-1)*25:page*25]]
        query = urlencode({'per_page': 25, 'page': page, 'include': INCLUDES,
                           'filter[taxons]': taxon, 'sort': 'name'})
        return {'url': self.profile['endpoint'] + '?' + query,
                'request_class': kind, 'page': page, 'taxon_id': taxon, 'expected_ids': expected}

    @staticmethod
    def validate(request, body):
        data = body.get('data', [])
        return ([str(p['id']) for p in data] == request['expected_ids'] and
                all(p.get('type') == 'product' for p in data))
