# build vxsacademy-base
FROM ubuntu:24.04
WORKDIR /home/ubuntu
COPY base-container-setup.sh ./
RUN ["/bin/bash", "base-container-setup.sh"]
EXPOSE 3000 3001