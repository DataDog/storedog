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

    def test_bounded_working_set(self):
        path = Path(self.directory.name)/'workload.json'
        profile = json.loads(path.read_text())
        profile.update(version=2, working_set='catalog-edges-category-first-v1')
        path.write_text(json.dumps(profile))
        workload = Workload(path)
        requests = [workload.request(i) for i in range(1000)]
        self.assertEqual(600, sum(r['request_class']=='catalog' for r in requests))
        self.assertEqual(23, len({r['url'] for r in requests}))
        self.assertEqual({1,20,40}, {r['page'] for r in requests if r['request_class']=='catalog'})
        self.assertEqual({1}, {r['page'] for r in requests if r['request_class']=='category'})
        self.assertEqual(20, len({r['taxon_id'] for r in requests if r['request_class']=='category'}))
        spec=importlib.util.spec_from_file_location('warm',Path(__file__).resolve().parents[1]/'warm-workload.py')
        warm=importlib.util.module_from_spec(spec);spec.loader.exec_module(warm)
        self.assertEqual(23,len(warm.targets(workload)))

    def test_wrong_page_same_count_fails(self):
        request = self.workload.request(0)
        body = {'data': [{'id': id, 'type': 'product'} for id in request['expected_ids']]}
        self.assertTrue(self.workload.validate(request, body))
        body['data'].reverse()
        self.assertFalse(self.workload.validate(request, body))
        self.assertFalse(self.workload.validate(request, {'data': []}))

    def test_all_unique_pages_are_warmed(self):
        import importlib.util
        spec=importlib.util.spec_from_file_location('warm',Path(__file__).resolve().parents[1]/'warm-workload.py')
        warm=importlib.util.module_from_spec(spec);spec.loader.exec_module(warm)
        requests=warm.targets(self.workload)
        self.assertEqual(80,len(requests))
        self.assertEqual(80,len({r['url'] for r in requests}))
        self.assertEqual(set(range(1,41)),{r['page'] for r in requests if r['request_class']=='catalog'})
        self.assertEqual(40,sum(r['request_class']=='category' for r in requests))

if __name__ == '__main__': unittest.main()
