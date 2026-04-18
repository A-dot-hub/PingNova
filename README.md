# PingNova - PaaS Uptime Monitoring Platform

PingNova is a production-ready cloud uptime monitoring system built with Node.js, Express, MySQL, and React.

## Features

- 🔐 JWT Authentication & User Management
- 📈 Real-time Uptime Monitoring & Charts
- 🔔 Email & Webhook Alerts
- 💰 SaaS Pricing Tiers (Free, Pro, Business)
- 🚀 Scalable AWS Architecture

## AWS EC2 Production Deployment Guide

Follow these step-by-step instructions to deploy PingNova on your AWS EC2 Ubuntu instance (`13.234.59.87`).

### Prerequisites

- SSH access to your EC2 instance (`pingnova-key.pem`)
- Amazon RDS MySQL instance running

### Step 1: Connect to your EC2 Instance

Open your terminal and connect using SSH:

```bash
ssh -i pingnova-key.pem ubuntu@16.171.138.147
```

### Step 2: Install Node.js, NPM, and PM2

Run the following commands on your EC2 instance to install the required software:

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally (Process Manager for Node.js)
sudo npm install -g pm2
```

### Step 3: Clone the Repository

Upload your code to the server. You can use `git clone` if your code is on GitHub, or `scp` to copy files directly.
Assuming you have cloned it into `~/pingnova`:

```bash
# Example: git clone https://github.com/yourusername/pingnova.git
cd ~/pingnova
```

### Step 4: Install Dependencies & Build

Install all required packages and build the React frontend:

```bash
# Install dependencies
npm install

# Build the React frontend
npm run build
```

### Step 5: Configure Environment Variables

Create a `.env` file in the root of your project:

```bash
nano .env
```

Paste the following configuration (update with your actual secrets):

```env
NODE_ENV=production
PORT=3000

# Database Configuration (Amazon RDS)
DB_HOST=
DB_USER=admin
DB_PASSWORD=
DB_NAME=pingnova
DB_PORT=3306

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email Alerts (SMTP Configuration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

### Step 6: Start the Application with PM2

Start the Node.js server using PM2 to ensure it runs in the background and restarts on crash:

```bash
# Start the server
pm2 start server.ts --interpreter ./node_modules/.bin/tsx --name pingnova

# Ensure PM2 starts on server reboot
pm2 startup
# Run the command outputted by the previous step, then:
pm2 save
```

### Step 7: Configure Nginx (Reverse Proxy)

Install and configure Nginx to route port 80 traffic to your Node.js app on port 3000.

```bash
# Install Nginx
sudo apt install nginx -y

# Create a new Nginx configuration file
sudo nano /etc/nginx/sites-available/pingnova
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name 16.171.138.147; # Replace with your domain name later

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and restart Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/pingnova /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Access Your Application

Your application is now live! Open your browser and navigate to:
`http://16.171.138.147`

### Optional: Setting up SSL (HTTPS) with Certbot

Once you point a domain name (e.g., `pingnova.com`) to your EC2 IP (`16.171.138.147`), you can secure it with a free SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Security Best Practices Implemented

- **Helmet.js**: Secures Express apps by setting various HTTP headers.
- **Bcrypt**: Hashes user passwords before storing them in the database.
- **JWT**: Stateless, secure authentication.
- **Zod**: Strict input validation to prevent NoSQL/SQL injection and bad data.
- **CORS**: Configured to prevent unauthorized cross-origin requests.
