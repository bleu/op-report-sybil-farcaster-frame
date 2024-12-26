# 📢 Report Sybil

A Farcaster Cast Action that enables reporting of suspicious sybil accounts, creating an open database of potential sybil activity that can be used by researchers and developers to improve sybil detection algorithms.

### 🔗 Adding the Cast Action on Warpcast

You can help the community by reporting suspicious sybil activity! Here's how:

1. **Quick Share**: Create a cast with this link to share Report Sybil on Warpcast:

```
https://op-report-sybil-farcaster-frame.vercel.app/api/add-report-sybil
```

2. **Adding without sharing**: Alternatively, add the cast-action directly through Warpcast's developer tools using [this link](https://warpcast.com/~/developers/frames?url=https%3A%2F%2Fop-report-sybil-farcaster-frame.vercel.app%2Fapi%2Fadd-report-sybil)

We encourage users to report suspicious sybil accounts to help maintain the integrity of the Farcaster ecosystem.

### 🧪 How to test

**Requirements**:

- docker
- docker-compose
- postgres@16
- node@20.X
- ngrok (must have a ngrok account and a configured static domain. Check [ngrok.com/getting-started](https://ngrok.com/docs/getting-started/) and [ngrok.com/domains](https://dashboard.ngrok.com/domains))

#### 1. Configure environment variables

1.1 Create a .env from .env.example

1.2 Set APP_URL as your ngrok domain

1.3 (optional) set a safer captcha encyption key

#### 2. Set up database

2.1 In a new terminal, run:

```
cd docker
docker-compose up -d
```

2.2 Check if the database was created

```
docker exec -it report-sybil-frame-container psql -U myuser -d postgres
\c report_sybil_frame_database
SELECT * FROM reports;
```

#### 3. Run frame

In a second terminal:

```
yarn install
npx prisma generate
yarn dev
```

#### 4. Host the local app on your ngrok domain

Open a third terminal and run:

```
ngrok http --url=<your-ngrok-url> http://localhost:3000
```

#### 5. Test the app on Warpcast

5.1 Go to [Warpcast developer tool](https://warpcast.com/~/developers/frames), type `<your-ngrok-url>/api/add-report-sybil` and add the report-sybil cast-action to your cast-actions bar

5.2 Find a sybil suspicious cast (i.e. [this one](https://warpcast.com/xnoora/0xc13b7f59)) and use the Report Sybil cast-action

5.3 Back in the database terminal, run again `SELECT * FROM reports;` to check if the new row was added

5.4 Now check that the API is working by searching on your browser:

- `<your-ngrok-url>/get-reports?fid=<fid-of-sybil-you-just-reported>`
- `<your-ngrok-url>/get-report-count?fid=<fid-of-sybil-you-just-reported>`

### 🔌 API Reference

The API provides two GET endpoints:

##### 1. Get Report Count

```
GET /get-report-count?fid=<fid>
```

Returns the unique reporters count for that fid:

```
{ reportCount }
```

##### 2. Get Reports

```
GET /get-reports?fid=<fid>
```

Returns all the reports pointing the fid as sybil:

```
{
  reports: {
   id,
   reporterFid,
   targetFid,
   castHash,
   messageHash,
   network,
   reportTimestamp,
   createdAt,
  }[]
}
```

### 📝 License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
