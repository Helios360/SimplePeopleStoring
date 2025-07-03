#!/bin/bash

echo "🔧 Starting installation..."

# 1. Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# 2. Check if MySQL is installed
if ! command -v mysql &> /dev/null
then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

# 3. Install npm dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Ask user for MySQL credentials
read -p "🗝️  Enter MySQL root password: " -s MYSQL_PASSWORD
echo
read -p "📂 Enter database name (default: test): " DB_NAME
DB_NAME=${DB_NAME:-test}

# 5. Create database and table if needed
echo "🧱 Setting up MySQL database and table..."
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
    user_id VARCHAR(100),
    password VARCHAR(100),
    agree BOOLEAN DEFAULT FALSE,
    date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

if [ $? -ne 0 ]; then
  echo "❌ Failed to set up database. Check your MySQL credentials and try again."
  exit 1
fi

# 6. Create .env file (optional – for future config)
echo "🌍 Creating .env file..."
cat <<EOT > .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$MYSQL_PASSWORD
DB_NAME=$DB_NAME
PORT=8080
EOT

# 7. Start the server
echo "🚀 Starting the server..."
node index.js
