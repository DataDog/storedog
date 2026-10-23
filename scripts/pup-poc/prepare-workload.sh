#!/bin/bash
# Run once during healthy setup. Does not restart the backend or touch PVCs.
set -euo pipefail
cd /root/pup-recovery
: "${PUP_CATALOG_PRODUCTS:=5000}"
: "${PUP_RATE:=5}"
kubectl -n storedog exec deployment/backend -- env PUP_CATALOG_PRODUCTS="$PUP_CATALOG_PRODUCTS" PUP_CATALOG_MANIFEST=/tmp/pup-catalog-v1.json bundle exec rake pup_course:seed
kubectl -n storedog exec deployment/backend -- cat /tmp/pup-catalog-v1.json > catalog-v1.json
python3 - "$PUP_RATE" <<'PY'
import json,sys
p=json.load(open('workload.json'));p['rate']=float(sys.argv[1])
json.dump(p,open('workload.json','w'),indent=2)
PY
kubectl -n storedog create configmap pup-traffic --from-file=fixed-traffic.py --from-file=workload.py --from-file=warm-workload.py --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f traffic-pod.json
kubectl -n storedog wait --for=condition=Ready pod/pup-traffic --timeout=120s
# Catalogs exceed the ConfigMap 1 MiB limit. Transfer data into the disposable generator.
for file in catalog-v1.json workload.json; do
  kubectl -n storedog exec -i pup-traffic -- sh -c "cat > /tmp/$file" < "$file"
done
