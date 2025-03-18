# 📢 Report Sybil

A Farcaster Frame V2 that enables checking and reporting suspicious sybil accounts, creating an open database of potential sybil activity that can be used by researchers and developers to improve sybil detection algorithms.

### 🔗 Usage on Warpcast

You can help the community by reporting suspicious sybil activity! Here's how:

1. **Quick Share**: Create a cast with this link to share Report Sybil on Warpcast:

```
https://op-report-sybil-farcaster-frame.vercel.app
```

2. **Adding without sharing**: Alternatively, add the cast-action directly through Warpcast's developer tools using [this link](https://warpcast.com/~/developers/frames?url=https%3A%2F%2Fop-report-sybil-farcaster-frame.vercel.app)

3. To check if a user is sybil, just open the frame and search for the user name you'd like to verify. The result will contain basic user informations and the sybil probability. You can then provide your own feedback (report the user as sybil or benign). The image below illustrates the frame UI.

![image](https://github.com/user-attachments/assets/f62df938-104a-4de5-b4b7-2839b34c490d)



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

The API provides a single GET endpoint:

```http
GET /api/check-sybil?fid={fid}
```

##### Success Reponse (200)

```typescript
{
  "success": true,
  "data": {
    "fid": string,
    "fname": string | null,
    "sybilProbability": number | null,
    "diagnosis": "benign" | "sybil" | null,
    "humanReports": number,
    "sybilReports": number,
    "lastUpdatedProbability": string // ISO 8601 date string
  }
}
```

##### Field descriptions

- fid: The Farcaster ID that was queried
- fname: The Farcaster username associated with the FID, if any
- sybilProbability: Probability score of the account being a sybil (0-1), if available
- diagnosis: Final diagnosis based on sybil probability
  - "benign": Account is classified as legitimate
  - "sybil": Account is classified as a sybil
  - null: No classification available
- humanReports: Number of unique reporters who flagged this account as human
- sybilReports: Number of unique reporters who flagged this account as sybil
- lastUpdatedProbability: Timestamp of when the sybil probability was last updated

#####

### 📝 License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.
