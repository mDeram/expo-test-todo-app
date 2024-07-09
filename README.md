# Todo app built with React-Native, Expo & Flask, SQLAlchemy

Exploration of tools and frameworks to get familiar with them by building a todo app
that support online syncing with a local first approach so it works without
a connection to the server.

## Frontend

```bash
cd frontend/
# Edit API_ENDPOINT to change the IP to your host IP, so your computer and phone can access the server on your local network.
vim constants.ts
npm install
npm run start
```

## Backend

```
cd backend/
pip3 install flask flask-cors SQLAlchemy
python3 main.py
```
