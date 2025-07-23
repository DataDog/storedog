#!/bin/bash
set -x
echo "Worker provision script. Replacing the node's kubeadm init script."
cp ./files/init-worker.sh /usr/bin/init.sh
systemctl enable kubeadm
