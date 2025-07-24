#!/bin/bash

echo ":D Starting installation..."

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo ":( Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 2. Check if MySQL is installed
if ! command -v mysql &> /dev/null
then
    echo ":( MySQL is not installed. Please install MySQL first."
    exit 1
fi

# 3. Install npm dependencies
echo ":3 Installing dependencies..."
npm install

# 4. Ask user for MySQL credentials
read -p "OwO Enter MySQL root password: " -s MYSQL_PASSWORD
echo
read -p "UwU Enter database name (default: Main): " DB_NAME
DB_NAME=${DB_NAME:-Main}

# 5. Create database and table if needed
echo ":3 Setting up MySQL database and table..."
mysql -u root -p$MYSQL_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
USE \`$DB_NAME\`;
CREATE TABLE IF NOT EXISTS Candidats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    fname VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    tel VARCHAR(20),
    addr TEXT,
    city VARCHAR(100),
    postal VARCHAR(20),
    birth DATE,
    cv VARCHAR(255),
    id_doc VARCHAR(255),
    password VARCHAR(100),
    agree BOOLEAN DEFAULT FALSE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags JSON,
    skills JSON,
    status TINYINT,
    is_admin TINYINT,
    tests JSON,
    gen_score INT,
);
EOF
# tests = [Frontend score/100 coef.1, Backend score/100 coef.0,70, Psychotechnical score/100 coef.1,5]
# gen_score = (F + 0.7 * B + 1.5 * P) / 3.2
if [ $? -ne 0 ]; then
  echo ":( Failed to set up database. Check your MySQL credentials and try again."
  exit 1
fi
echo ":D MySQL database '$DB_NAME' and table 'Candidats' are ready."

# 6. Create .env file (optional – for future config)
echo "OwO Creating .env file..."
cat <<EOT > .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$MYSQL_PASSWORD
DB_NAME=$DB_NAME
PORT=8080
EOT

# 7. Start the server
echo "O.O Starting the server..."
node index.js