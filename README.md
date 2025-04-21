# URL Catalog

A beautiful Bootstrap HTML5 catalog for sites, designed to handle large lists of URLs (30,000+) efficiently. This application is optimized for deployment on Ubuntu 24.04 servers.

## Features

- Fast-loading catalog with efficient rendering of large URL lists
- Search functionality with real-time filtering
- Responsive design that works across all devices
- Performance optimization for handling 30,000+ URLs
- Clean, modern Bootstrap 5 interface

## Installation

1. Clone the repository or download the files to your server

2. Place your `url0.txt` file in the root directory of the project. This file should contain one URL per line.

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

The server will start on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## Ubuntu 24.04 Deployment

### Prerequisites

- Node.js (v18 or newer)
- npm (comes with Node.js)

### Setup on Ubuntu 24.04

1. Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

2. Install Node.js and npm:

```bash
sudo apt install nodejs npm -y
```

3. Verify installation:

```bash
node -v
npm -v
```

4. Clone or download the application to your server

5. Navigate to the application directory and install dependencies:

```bash
cd url-catalog
npm install
```

6. Place your `url0.txt` file in the root directory

7. Start the application:

```bash
npm start
```

### Running as a Service (optional)

To run the application as a background service with auto-restart:

1. Install PM2:

```bash
sudo npm install -g pm2
```

2. Start the application with PM2:

```bash
pm2 start server.js --name url-catalog
```

3. Configure PM2 to start on boot:

```bash
pm2 startup
```

4. Follow the instructions provided by PM2 to create the startup script

5. Save the current PM2 configuration:

```bash
pm2 save
```

## Usage

- Access the application at `http://your-server-ip:3000`
- Use the search box to filter URLs
- Adjust the number of URLs displayed per page using the dropdown
- Navigate through pages using the pagination controls
- Click the eye icon to view URL details
- Click the arrow icon to visit the URL in a new tab

## Performance Considerations

The application is optimized for large URL lists:

- Server-side pagination
- Caching of API responses
- Rate limiting to prevent abuse
- Compression for faster response times
- Efficient client-side rendering

## License

MIT