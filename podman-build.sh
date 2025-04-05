cp /home/public/node ./node -r
podman build -t vxsacademy-img .
podman run --replace -it --name vxsacademy vxsacademy-img:latest /bin/bash