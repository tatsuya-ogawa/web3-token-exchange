FROM node:18-bullseye
WORKDIR /opt/hardhat/node
RUN yarn add hardhat typescript ts-node
RUN apt-get update && apt-get install -y curl && apt-get clean
ENTRYPOINT [ "yarn","hardhat","node" ]