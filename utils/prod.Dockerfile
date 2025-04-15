# build vxsacademy-base
FROM vxsacademy-base:latest
WORKDIR /home/ubuntu
COPY . ./vxsacademy
WORKDIR ./vxsacademy