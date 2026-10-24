import datetime
import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('monitors',Path(__file__).resolve().parents[1]/'monitor-gates.py')
monitors=importlib.util.module_from_spec(spec);spec.loader.exec_module(monitors)
def row(at,state):
    return {'id':1,'at':datetime.datetime.fromtimestamp(at,datetime.timezone.utc).isoformat(),'overall_state':state}


class MonitorEvidence(unittest.TestCase):
    def test_rollout_only_alert_does_not_count(self):
        result=monitors.assess([row(10,'Alert'),row(60,'OK'),row(90,'OK'),row(120,'OK')],1,60,130)
        self.assertTrue(result['coverage_complete'])
        self.assertFalse(result['alert_observed'])

    def test_fading_alert_fails_at_fault_end(self):
        result=monitors.assess([row(60,'Alert'),row(90,'Alert'),row(120,'OK')],1,60,130)
        self.assertTrue(result['alert_observed'])
        self.assertFalse(result['alert_at_end'])

    def test_missing_or_error_observation_is_incomplete(self):
        self.assertFalse(monitors.assess([row(60,'Alert'),row(120,'Alert')],1,60,130)['coverage_complete'])
        self.assertFalse(monitors.assess([row(60,'Alert'),row(90,None),row(120,'Alert')],1,60,130)['coverage_complete'])

    def test_live_alert_and_ok_error_monitor_have_complete_coverage(self):
        for state in ('Alert','OK'):
            result=monitors.assess([row(t,state) for t in (60,90,120)],1,60,130)
            self.assertTrue(result['coverage_complete'])
            self.assertEqual(state=='Alert',result['alert_at_end'])


if __name__=='__main__':unittest.main()
