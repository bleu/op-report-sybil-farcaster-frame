### Test locally

1. Open a terminal and run:

```
yarn install
yarn dev
```

2. Open a second terminal and run:

```
yarn frog
```

3. Go to `http://localhost:5173` in your browser

4. Type `http://localhost:3000` and search

### Test on Warpcast developer tool

1. Set a ngrok static URL in .env.local

2. Open a terminal and run:

```
yarn install
yarn dev
```

3. Open a second terminal and run:

```
ngrok http --url=<your-ngrok-url> http://localhost:3000
```

4. Go to [Warpcast developer tool](https://warpcast.com/~/developers/frames) and type your ngrok static URL
