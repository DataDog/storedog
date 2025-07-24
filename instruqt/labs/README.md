



Using a Local Registry
===

It's important to note that unlike Docker Compose, K8s won't build container images. Images must be pre-built and hosted in a registry. For development, you can run a local registry. Then build and push images.

> [!IMPORTANT]
> The images must be built and pushed on the `worker` node as that is where the services will run and look for `localhost`.

1. Start a local Docker registry:

    ```bash,run
    docker run -d -p 5000:5000 --restart=always --name registry registry:2
    ```

1. Configure worker nodes to trust the insecure registry:

    1. On each WORKER node only (not needed on control plane), add the registry to `/etc/docker/daemon.json`:

        ```bash,run
        echo '{ "insecure-registries": ["localhost:5000"] }' | tee /etc/docker/daemon.json
        ```

    1. Restart Docker on each WORKER node:

        ```bash,run
        sudo systemctl restart docker
        ```

1. Build and push **ALL** images to local registry:

    ```bash,run,wrap
    REGISTRY_URL=localhost:5000; find ./services -name Dockerfile | while read dockerfile; do context_dir=$(dirname "$dockerfile"); image_name=$(echo "$context_dir" | sed 's|^\./services/||; s|/|-|g'); full_tag="$REGISTRY_URL/$image_name:latest"; echo "Building $full_tag from $context_dir"; docker build -t "$full_tag" "$context_dir" && docker push "$full_tag"; done
    ```

# Build and Push One Service

You may want to rebuild one service while testing.

1. Set the `REGISTRY_URL` variable to your local registry URL if it hasn't been set yet:

    ```bash,run
    export REGISTRY_URL=localhost:5000
    ```

1. Set the `SERVICE_NAME` variable to the service you want to build:

    ```bash
    export SERVICE_NAME=ads
    ```

1. Then run the following command to build and push the service:

```bash,run,wrap
docker build -t $REGISTRY_URL/$SERVICE_NAME:latest ./services/$SERVICE_NAME && docker push $REGISTRY_URL/$SERVICE_NAME:latest
```

