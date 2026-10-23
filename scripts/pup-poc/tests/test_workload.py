import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from workload import Workload

class WorkloadTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        products = [{'key': f'p-{i:04}', 'id': str(i), 'category': i % 20} for i in range(1000)]
        (root/'catalog.json').write_text(json.dumps({'version': 1, 'counts': {'products': 1000},
            'products': products, 'catalog_taxon_id': '99',
            'categories': [{'key': i, 'id': str(100+i)} for i in range(20)]}))
        (root/'workload.json').write_text(json.dumps({'version': 1, 'catalog': 'catalog.json',
            'endpoint': 'http://proxy/products', 'rate': 5}))
        self.workload = Workload(root/'workload.json')

    def test_mix_rotation_and_pagination(self):
        requests = [self.workload.request(i) for i in range(1000)]
        self.assertEqual(600, sum(r['request_class']=='catalog' for r in requests))
        self.assertEqual(20, len({r['taxon_id'] for r in requests if r['request_class']=='category'}))
        self.assertEqual({1, 2}, {r['page'] for r in requests if r['request_class']=='category'})
        self.assertTrue(all(len(r['expected_ids'])==25 for r in requests))
        self.assertEqual(requests, [self.workload.request(i) for i in range(1000)])

    def test_wrong_page_same_count_fails(self):
        request = self.workload.request(0)
        body = {'data': [{'id': id, 'type': 'product'} for id in request['expected_ids']]}
        self.assertTrue(self.workload.validate(request, body))
        body['data'].reverse()
        self.assertFalse(self.workload.validate(request, body))
        self.assertFalse(self.workload.validate(request, {'data': []}))

if __name__ == '__main__': unittest.main()
