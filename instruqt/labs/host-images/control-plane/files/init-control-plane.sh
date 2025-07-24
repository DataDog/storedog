#!/bin/bash
set -x

echo "Initializing cluster..."

export K8S_VERSION=$(cat /etc/k8s_version)
kubeadm init --config /root/k8s_cluster_config.yaml

export K8S_AUDIT_LOGS=$(cat /etc/k8s_audit_logs)

if [ $K8S_AUDIT_LOGS ]
then
  # Enable audit logs
  mkdir -p /var/log/kubernetes/apiserver
  touch /var/log/kubernetes/apiserver/audit.log
  
  sed -i '/tls-private-key-file/a \ \ \ \ - --audit-policy-file=/etc/kubernetes/audit-policies/policy.yaml' /etc/kubernetes/manifests/kube-apiserver.yaml
  sed -i '/audit-policy-file/a \ \ \ \ - --audit-log-path=/var/log/kubernetes/apiserver/audit.log' /etc/kubernetes/manifests/kube-apiserver.yaml
  sed -i '/volumes:/a \ \ - {hostPath: {path: /etc/kubernetes/audit-policies, type: DirectoryOrCreate}, name: k8s-audit-policies}' /etc/kubernetes/manifests/kube-apiserver.yaml
  sed -i '/volumeMounts:/a \ \ \ \ - {mountPath: /etc/kubernetes/audit-policies, name: k8s-audit-policies, readOnly: true}' /etc/kubernetes/manifests/kube-apiserver.yaml
  sed -i '/volumes:/a \ \ - {hostPath: {path: /var/log/kubernetes, type: DirectoryOrCreate}, name: k8s-logs}' /etc/kubernetes/manifests/kube-apiserver.yaml
  sed -i '/volumeMounts:/a \ \ \ \ - {mountPath: /var/log/kubernetes, name: k8s-logs}' /etc/kubernetes/manifests/kube-apiserver.yaml
fi

echo "Waiting until Kubernetes is running..."
sleep 10 
while ! nc -z localhost 6443; do sleep 1; done

# echo "Copying authorization file..."
mkdir -p /root/.kube
cp /etc/kubernetes/admin.conf /root/.kube/admin.conf
export KUBECONFIG=/root/.kube/admin.conf

echo "Installing Calico networking..."
CALICO_MANIFESTS_DIR=/etc/kubernetes/calico
kubectl create -f $CALICO_MANIFESTS_DIR/tigera-operator.yaml
# The next kubectl create fails with "Error from server (NotFound): the server could not find the requested resource"
# Is there a better way to ensure it will run correctly?
sleep 10 
kubectl create -f $CALICO_MANIFESTS_DIR/custom-resources.yaml

echo "source /usr/share/bash-completion/bash_completion" >> ~/.bashrc
echo "source <(kubectl completion bash)" >> ~/.bashrc
echo 'alias k="kubectl"' >> ~/.bashrc
