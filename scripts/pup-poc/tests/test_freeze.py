import hashlib
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]

class FreezeProvenance(unittest.TestCase):
    def test_different_image_cannot_reuse_passing_acceptance(self):
        candidate=json.loads((ROOT/'candidate.json').read_text())
        inputs={name:hashlib.sha256((ROOT/name).read_bytes()).hexdigest() for name in
                ('fixed-traffic.py','workload.py','warm-workload.py','course-profile.json','window-gates.py','calibrate.py')}
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            catalog={'counts':{'products':5000},'content_sha256':'catalog-checksum'}
            calibration={'http_candidate':True,'cpu_m':170,'rate':5,'profile':{
                'candidate':candidate['digest'],'catalog_checksum':catalog['content_sha256'],'rate':5,'inputs':inputs}}
            (root/'catalog.json').write_text(json.dumps(catalog))
            (root/'calibration.json').write_text(json.dumps(calibration))
            command=['python3',str(ROOT/'freeze-scenario.py'),str(root/'calibration.json'),str(root/'catalog.json'),str(root/'profile.json')]
            subprocess.run(command,check=True,capture_output=True)
            frozen=json.loads((root/'profile.json').read_text())
            run={'pass':True,'catalog_checksum':catalog['content_sha256'],'rate':5,'cpu':'170m',
                 'candidate':'sha256:'+'0'*64,'inputs':frozen['inputs']}
            (root/'acceptance.json').write_text(json.dumps({'accepted':True,'runs':[run]*4}))
            rejected=subprocess.run(command+['--acceptance',str(root/'acceptance.json')],capture_output=True)
            self.assertNotEqual(0,rejected.returncode)
            self.assertEqual('frozen',json.loads((root/'profile.json').read_text())['status'])
            calibration['profile']['candidate']='sha256:'+'1'*64
            (root/'calibration.json').write_text(json.dumps(calibration))
            self.assertNotEqual(0,subprocess.run(command,capture_output=True).returncode)

if __name__=='__main__':unittest.main()
