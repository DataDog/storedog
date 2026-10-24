import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('status',Path(__file__).resolve().parents[1]/'preparation-status.py')
status=importlib.util.module_from_spec(spec);spec.loader.exec_module(status)

class PreparationTests(unittest.TestCase):
    def test_new_preparation_replaces_stale_ready_atomically(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            with patch.dict('os.environ',{'DD_ENV':'new-sandbox'}):
                status.write(root,'old','ready')
                status.write(root,'starting preparation')
            value=json.loads((root/'preparation.json').read_text())
            self.assertEqual('preparing',value['state'])
            self.assertEqual('new-sandbox',value['environment'])
            self.assertEqual(['preparation.json'],[p.name for p in root.iterdir()])
            status.write(root,'preparation','failed','Saved diagnostics')
            self.assertEqual('failed',json.loads((root/'preparation.json').read_text())['state'])

class LauncherTests(unittest.TestCase):
    def execute(self,root,loaded='not-found',env=None):
        import os
        code=compile((Path(__file__).resolve().parents[1]/'start-preparation.py').read_text(),'start-preparation.py','exec')
        with patch('pathlib.Path',return_value=root), patch('subprocess.check_output',return_value=loaded), patch('subprocess.run') as run, patch.dict(os.environ,env or {},clear=True):
            try:exec(code,{'__name__':'__main__'})
            except SystemExit as error:self.assertEqual(0,error.code)
            return run.call_args_list

    def test_duplicate_does_not_launch_or_overwrite_credentials(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'preparation.env').write_text('existing')
            calls=self.execute(root,loaded='loaded')
            self.assertEqual(1,len(calls))
            self.assertEqual(['systemctl','is-active','--quiet','pup-preparation.service'],calls[0].args[0])
            self.assertEqual('existing',(root/'preparation.env').read_text())

    def test_credentials_private_not_on_command_line(self):
        import stat
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);path=root/'preparation.env';path.touch();path.chmod(0o644)
            calls=self.execute(root,env={'DD_API_KEY':'test-secret','DD_ENV':'sandbox','UNRELATED_SECRET':'excluded'})
            self.assertEqual(0o600,stat.S_IMODE(path.stat().st_mode))
            self.assertNotIn('test-secret',str(calls))
            self.assertNotIn('UNRELATED_SECRET',path.read_text())
            self.assertIn('RuntimeMaxSec=900',str(calls))
            self.assertIn('ExecStopPost=',str(calls))

    def test_failed_existing_service_is_not_restarted(self):
        import subprocess
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            code=compile((Path(__file__).resolve().parents[1]/'start-preparation.py').read_text(),'start-preparation.py','exec')
            with patch('pathlib.Path',return_value=root), patch('subprocess.check_output',return_value='loaded'), patch('subprocess.run',side_effect=subprocess.CalledProcessError(3,'systemctl')) as run:
                with self.assertRaises(subprocess.CalledProcessError):exec(code,{'__name__':'__main__'})
                self.assertEqual(1,run.call_count)
