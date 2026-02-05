# Usa a imagem oficial do Node.js como base
FROM node:24.13.0
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# Define diretório de trabalho dentro do container
WORKDIR /home/node/app

# Instala dependências do sistema para o Oracle Instant Client
RUN apt-get update && apt-get install -y \
  libaio1 unzip curl tzdata && \
  ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
  echo $TZ > /etc/timezone && \
  rm -rf /var/lib/apt/lists/*

# Instala o Yarn globalmente
RUN corepack enable && yarn set version stable

# Define variáveis de ambiente para o Oracle Client
ENV ORACLE_BASE=/opt/oracle
ENV ORACLE_HOME=$ORACLE_BASE/instantclient_23.7
ENV PATH=$ORACLE_HOME:$PATH
ENV LD_LIBRARY_PATH=$ORACLE_HOME
ENV TNS_ADMIN=$ORACLE_HOME/network/admin
ENV TZ=America/Sao_Paulo
# Baixa e instala o Oracle Instant Client 19.8
# Baixa e instala o Oracle Instant Client 23.7
RUN curl -L -o instantclient-basiclite.zip https://download.oracle.com/otn_software/linux/instantclient/2370000/instantclient-basic-linux.x64-23.7.0.25.01.zip && \
  mkdir -p /opt/oracle && \
  unzip instantclient-basiclite.zip -d /opt/oracle && \
  rm -f instantclient-basiclite.zip && \
  ln -sf /opt/oracle/instantclient_23_7/libclntsh.so.23.7 /opt/oracle/instantclient_23_7/libclntsh.so && \
  sh -c "echo /opt/oracle/instantclient_23_7 > /etc/ld.so.conf.d/oracle-instantclient.conf" && \
  ldconfig && \
  export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_7:$LD_LIBRARY_PATH



# Instala o NestJS CLI globalmente
RUN npm i -g @nestjs/cli

# Copia apenas os arquivos de dependências primeiro (para cache)
COPY package.json ./

# Instala dependências sem rodar o build (evita problemas com hot reload)
RUN npm install

# Copia todo o código do projeto para dentro do container
COPY --chown=node:node . .

# Expõe a porta usada pelo NestJS
EXPOSE 3000

# Comando para iniciar o servidor em modo desenvolvimento
CMD ["npm", "run", "start:dev"]
