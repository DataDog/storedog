#!/bin/bash
set -x
echo "Control plane provision script. Replacing the node's kubeadm init script."
cp ./files/init-control-plane.sh /usr/bin/init.sh
systemctl enable kubeadm
