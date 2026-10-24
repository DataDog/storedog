import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]

class TelemetryTests(unittest.TestCase):
    def test_first_span_does_not_overwrite_cli_options(self):
        code=compile((ROOT/'watch-telemetry.py').read_text(),str(ROOT/'watch-telemetry.py'),'exec')
        with tempfile.TemporaryDirectory() as directory:
            output=Path(directory)
            span={'data':[{'attributes':{'trace_id':'42','start_timestamp':'2026-10-24T00:00:00Z'}}]}
            with patch('sys.argv',['watch-telemetry.py','--once']), patch('os.environ',{'DD_ENV':'isolated'}), patch('pathlib.Path',return_value=output), patch('subprocess.check_output',side_effect=[json.dumps(span),'']):
                exec(code,{'__name__':'__main__'})
            self.assertEqual('42',json.loads((output/'db-spans.jsonl').read_text())['spans'][0]['trace_id'])
            self.assertTrue(json.loads((output/'backend-errors.jsonl').read_text())['polled'])
