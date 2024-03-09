FROM rust:1.76 as wasm-builder
WORKDIR /usr/src/app

COPY ./Cargo.toml /usr/src/app
COPY ./Cargo.lock /usr/src/app
COPY ./src /usr/src/app/src/

RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
RUN wasm-pack build

FROM node:21 as app
WORKDIR /usr/src/app

COPY --from=wasm-builder /usr/src/app/pkg /usr/src/app/pkg
COPY ./www ./www

WORKDIR /usr/src/app/www

RUN npm install

ENTRYPOINT ["npm", "docker-start"]