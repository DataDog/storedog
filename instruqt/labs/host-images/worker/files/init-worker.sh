#!/bin/bash
set -x

kubeadm join control-plane:6443 \
  --token pregen.eratedtokenvalue \
  --discovery-token-unsafe-skip-ca-verification \
  --cri-socket unix:///var/run/containerd/containerd.sock

echo "source /usr/share/bash-completion/bash_completion" >> ~/.bashrc
echo "source <(kubectl completion bash)" >> ~/.bashrc
echo 'alias k="kubectl"' >> ~/.bashrc
