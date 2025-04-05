FROM ubuntu:24.04
WORKDIR /home/ubuntu
COPY . ./vxsacademy
EXPOSE 3000 3001
WORKDIR ./vxsacademy