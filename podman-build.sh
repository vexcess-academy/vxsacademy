cp ~/.nvm/versions/node/v22.14.0 ./node -r
podman build -t vxsacademy-img .
podman run --replace -it --name vxsacademy vxsacademy-img:latest /bin/bash