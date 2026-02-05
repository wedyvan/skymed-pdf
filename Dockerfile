# Etapa 1: Build da aplicação
FROM node:24 AS builder

# Diretório de trabalho
WORKDIR /app

RUN npm install -g @nestjs/cli

# Copia os arquivos de dependência
COPY package.json ./

# Instala as dependências do projeto
RUN npm install 

# Copia o restante do código
COPY . .

# Compila o projeto NestJS
RUN npm run build


# Etapa 2: Produção
FROM node:24-slim AS production

# Instala dependências do sistema para Oracle Instant Client
RUN apt-get update && apt-get install -y \
  libaio1 unzip curl ghostscript && \
  rm -rf /var/lib/apt/lists/*

# Diretório de trabalho
WORKDIR /app


RUN npm install -g @nestjs/cli

# Define variáveis de ambiente do Oracle
ENV ORACLE_BASE=/opt/oracle
ENV ORACLE_HOME=$ORACLE_BASE/instantclient_23_7
ENV PATH=$ORACLE_HOME:$PATH
ENV LD_LIBRARY_PATH=$ORACLE_HOME
ENV TNS_ADMIN=$ORACLE_HOME/network/admin

# Instala o Oracle Instant Client 23.7
RUN curl -L -o instantclient-basiclite.zip https://download.oracle.com/otn_software/linux/instantclient/2370000/instantclient-basic-linux.x64-23.7.0.25.01.zip && \
  mkdir -p /opt/oracle && \
  unzip instantclient-basiclite.zip -d /opt/oracle && \
  rm -f instantclient-basiclite.zip && \
  ln -sf /opt/oracle/instantclient_23_7/libclntsh.so.23.7 /opt/oracle/instantclient_23_7/libclntsh.so && \
  echo /opt/oracle/instantclient_23_7 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
  ldconfig

# Copia apenas o que é necessário para execução
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Instala apenas as dependências de produção
RUN npm install

# Expõe a porta usada pela aplicação
EXPOSE 3000

# Comando de execução (produção)
CMD ["node", "dist/main.js"]
