# Political Representation Dashboard

A web dashboard visualizing the alignment between Swiss political institutions (Parliament, Bundesrat, political parties) and the Swiss public, based on data from the [Swissvotes](https://swissvotes.ch) dataset.

Developed as part of a student project at **Berner Fachhochschule (BFH)**.

---

##  Features

-  Visualizations showing agreement between institutions and public votes
-  Party and canton-based filtering
-  Choropleth map of cantonal representation
-  Multilingual UI (DE, FR, IT, EN)
-  Automated daily data fetching from Swissvotes

---

##  Technologies

**Frontend** (Vue 3 + Vite + D3)
- Vue 3, Vue Router, Vue I18n
- D3.js for data visualization
- Tailwind CSS for styling
- TypeScript

**Backend**
- Node.js, Express
- PostgreSQL (with Docker)
- Axios, csv-parser, node-cron
- TypeScript + Vitest

---

## Setup Instructions

This deployment works on macOS, Linux, and Windows (via Git Bash or WSL).


# 1. Download the deployment script
```bash
curl -O https://raw.githubusercontent.com/damian-lienhart/political-representation-dashboard/main/deploy-server.sh
```
# 2. Make it executable (macOS, Linux, WSL, Git Bash)
```bash
chmod +x deploy-server.sh
```
# 3. Run the deployment script
```bash
./deploy-server.sh
```
Windows users: Please use Git Bash or WSL (Windows Subsystem for Linux) to run the script.
Do not run it in Command Prompt or PowerShell.

Frontend: http://localhost:8080  
Backend API: http://localhost:3000/api

---

##  Data Source

We use the official open dataset from **[Swissvotes](https://swissvotes.ch/page/dataset/)**  
 The dataset is public under [Open Government Data](https://opendata.swiss/en/dataset/swissvotes).

---

##  Project Team

- **Damian Lienhart**
- **Sujal Singh Basnet**
- Project supervised by **Prof. Dr. Simon Kramer** (BFH)

---

##  License

This project is licensed under the **MIT License** – see [`LICENSE`](./LICENSE) for details.

All dependencies used are open source and MIT-compatible. See `package.json` for details.
