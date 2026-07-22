Here is a clear, step-by-step guide you can share with your team to set up **Docker Desktop** and run **PostgreSQL with the `pgvector` extension** (which you need for your KYC CLM platform).

---

## Part 1: Install Docker Desktop

### Step 1: System Requirements & Prerequisites

Before downloading, ensure your Windows machine has **WSL 2** (Windows Subsystem for Linux) enabled:

1. Open **Command Prompt** or **PowerShell** as **Administrator**.
2. Run the following command:
```cmd
wsl --install

```


3. **Restart your computer** if prompted.

---

### Step 2: Download & Install Docker Desktop

1. Go to the official download page: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
2. Click **Download for Windows**.
3. Run the installer (`Docker Desktop Installer.exe`).
4. On the Configuration screen, make sure **"Use WSL 2 instead of Hyper-V"** is **checked**.
5. Click **OK** and let the installation complete.
6. **Restart your computer** when finished.

---

### Step 3: Verify Docker Installation

1. Search for and launch **Docker Desktop** from your Windows Start Menu.
2. Accept the terms and wait until the whale icon in your taskbar status turns solid blue (or Docker Desktop shows **"Engine running"**).
3. Open terminal/cmd and test it:
```cmd
docker --version

```



---

## Part 2: Run PostgreSQL (pgvector) Container

Instead of installing PostgreSQL directly on your host machine, you will run it inside a Docker container.

### Step 1: Run the Docker Container

Run this single command in your Terminal/Command Prompt to create and start the database:

```cmd
docker run -d ^
  --name dbtitan-postgres ^
  -p 5432:5432 ^
  -e POSTGRES_DB=myapp_db ^
  -e POSTGRES_USER=app_user ^
  -e POSTGRES_PASSWORD=mysecretpassword ^
  pgvector/pgvector:pg16

```

> **Note for macOS / Linux users:** Replace `^` with `\` at the end of each line in terminal.

#### What this command does:

* `--name dbtitan-postgres`: Names your container so it's easy to identify.
* `-p 5432:5432`: Maps port `5432` inside Docker to `5432` on your `localhost`.
* `-e POSTGRES_DB=myapp_db`: Creates the initial database `myapp_db`.
* `-e POSTGRES_USER=app_user`: Sets database username.
* `-e POSTGRES_PASSWORD=mysecretpassword`: Sets database password.
* `pgvector/pgvector:pg16`: Downloads the official Postgres 16 image with built-in vector support.

---

### Step 2: Verify Database is Running

Run the following command to check active containers:

```cmd
docker ps

```

You should see `dbtitan-postgres` in the output list with status **Up**.

---

## Part 3: Useful Commands for Team Members

Here are quick commands for daily development:

### Stop the Database Container

```cmd
docker stop dbtitan-postgres

```

### Start the Database Container (Next day / after restart)

```cmd
docker start dbtitan-postgres

```

### Access PostgreSQL Command Line Directly

```cmd
docker exec -it dbtitan-postgres psql -U app_user -d myapp_db

```

---

## Part 4: Connect from Spring Boot (`application.properties`)

Ensure everyone's `src/main/resources/application.properties` uses these exact matching connection credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/myapp_db
spring.datasource.username=app_user
spring.datasource.password=mysecretpassword
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

```