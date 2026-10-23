import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
HERE=Path(__file__).resolve().parents[1]
class Acceptance(unittest.TestCase):
    def test_missing_evidence_fails_closed(self):
        with tempfile.TemporaryDirectory() as d:
            p=subprocess.run([sys.executable,str(HERE/'acceptance.py'),d,d,d,'--soak',d,'--output',d+'/result.json'],capture_output=True)
            self.assertEqual(1,p.returncode)
            self.assertFalse(json.loads(Path(d+'/result.json').read_text())['accepted'])
    def test_single_url_remains_standalone(self):
        with tempfile.TemporaryDirectory() as d:
            probe=Path(d)/'fixed-traffic.py';probe.write_bytes((HERE/'fixed-traffic.py').read_bytes())
            p=subprocess.run([sys.executable,str(probe),'--duration','.01','--rate','1'],capture_output=True,text=True)
            self.assertEqual(0,p.returncode,p.stderr)
            self.assertEqual('summary',json.loads(p.stdout)['type'])
    def test_pin_changes_only_backend(self):
        with tempfile.TemporaryDirectory() as d:
            output=Path(d)/'lock.json'
            subprocess.run([sys.executable,str(HERE/'pin-candidate.py'),str(HERE/'candidate.json'),str(output)],check=True)
            old=json.loads((HERE/'images.lock.json').read_text())['images'];new=json.loads(output.read_text())['images']
            changes=[a['reference'] for a,b in zip(old,new) if a!=b]
            self.assertEqual(['ghcr.io/datadog/storedog/backend:1.5.0'],changes)
