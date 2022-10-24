FROM node:18-bullseye
WORKDIR /opt/app
ADD . /opt/app
RUN bash -c "cd hardhat && yarn && yarn build"
RUN bash -c "cd backend && yarn"
WORKDIR /opt/app/backend
ENTRYPOINT ["yarn","start"]