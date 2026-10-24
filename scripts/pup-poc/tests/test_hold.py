import importlib.util
from pathlib import Path
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('hold',Path(__file__).resolve().parents[1]/'development-hold.py')
hold=importlib.util.module_from_spec(spec);spec.loader.exec_module(hold)


class DevelopmentHold(unittest.TestCase):
    def test_two_stages_share_one_absolute_hour_deadline(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);clock=[100]
            now=lambda:clock[0]
            def sleep(seconds):clock[0]+=seconds
            first=hold.initialize(root,3600,now)
            self.assertEqual(0,hold.wait_segment(root,now=now,sleep=sleep))
            self.assertEqual(1900,clock[0])
            self.assertEqual(first,hold.initialize(root,3600,now))
            self.assertEqual(1,hold.wait_segment(root,True,now,sleep))
            self.assertEqual(3700,clock[0])

    def test_export_acknowledgement_releases_both_stages(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);hold.initialize(root,3600,lambda:100)
            (root/'integration-complete').touch()
            for final in (False,True):self.assertEqual(0,hold.wait_segment(root,final,lambda:101))

    def test_out_of_range_hold_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            for seconds in (0,59,3601):
                with self.assertRaises(ValueError):hold.initialize(Path(directory),seconds)


if __name__=='__main__':unittest.main()
