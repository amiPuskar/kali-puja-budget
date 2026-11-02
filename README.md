# Puja Budget Management System

Puja Budget Management System helps a Puja committee organize an event from planning to completion. The committee can manage Puja records, plan budgets, track money collected and spent, organize programs and tasks, monitor supplies, and review activity on a dashboard.

The app is built with Next.js and stores shared records in Firebase Cloud Firestore. This guide explains how to run the app, how a committee member uses it, and where developers or AI coding agents should look when changing it.

> **Important:** Login and role checks currently happen in the browser, and passwords are stored in Firestore as plaintext. Do not use this app with real member passwords or sensitive data until the authentication and security issues in [Security limitations](#security-limitations) are fixed.

## What the app does

- **Plan a Puja:** Create records for different years and choose the active Puja from the top bar.
- **Plan spending:** Create reusable budget categories and allocate a budget to a specific Puja.
- **Track income:** Record member contributions, neighborhood (para) collections, and sponsor donations.
- **Track expenses:** Record spending and associate it with budget categories.
- **Coordinate activities:** Manage events, participants, prizes, tasks, volunteers, and inventory.
- **Manage membership:** Collect signup requests, approve members, and assign committee roles.
- **Review progress:** See financial totals and operational summaries on the dashboard.

This is a record-keeping and coordination tool; it does not process payments. It does not automatically create a Puja or sample records.

## Technology

- Next.js 14 App Router and React 18
- JavaScript (the repository also has a TypeScript configuration)
- Firebase Cloud Firestore
- Zustand for shared in-memory page state
- Tailwind CSS for styling
- Lucide React icons and React Hot Toast notifications

## Getting started

### Requirements

- Node.js 18 or newer
- npm
- A Firebase project with Cloud Firestore enabled

### Run locally

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the repository root. Copy the variable names from [`env.example`](./env.example) and set the values for the Firebase web app you intend to use:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

   `.env.local` is ignored by Git. The current [`lib/firebaseConfig.js`](./lib/firebaseConfig.js) also has fallback values for a Firebase project. Set your own environment values rather than relying on those fallbacks.

3. Configure Firestore rules for the exact collections the app uses. Do not use open read/write rules for a public or production database. The custom login does **not** create a Firebase Authentication session, so rules using `request.auth` will not recognize an app login as an authenticated Firebase user. Read [Security limitations](#security-limitations) before using any shared or real data.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

Restart the development server after changing `.env.local`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve a production build |
| `npm run lint` | Run Next.js ESLint checks |

There is no test script currently configured in `package.json`.

## Pages and how to use them

### Entry pages

| Route | What it is for |
| --- | --- |
| `/login` | Sign in with an existing member record |
| `/signup` | Submit a request to join the club |
| `/unauthorized` | Explain that the current user lacks a required interface role |

### Main application

The dashboard and feature pages require a locally remembered user session. The sidebar links to these pages; the top-bar Puja selector changes the active Puja where applicable.

| Route | What it is for |
| --- | --- |
| `/` | Dashboard with financial totals and operational summaries |
| `/pujas` | Create and manage Puja records |
| `/budget-items` | Create reusable budget categories such as lighting or decorations |
| `/budget` | Set budget allocations for the selected Puja |
| `/contributions` | Record contributions from club members for the selected Puja |
| `/para-collection` | Record money collected from the local neighborhood for the selected Puja |
| `/expenses` | Record and categorize spending for the selected Puja |
| `/members` | View and manage club member records |
| `/pending-members` | Review, approve, or reject membership requests |
| `/profile` | View the current user's profile |
| `/signup-link` | Get a link to the membership registration page |
| `/events` | Manage events, participants, and prizes |
| `/tasks` | Create and track committee tasks and volunteers |
| `/inventory` | Track supplies, quantities, and whether items have arrived |
| `/sponsors` | Record sponsors, donations, and receipt status |

### Suggested committee workflow

1. An administrator reviews membership requests and maintains the club member list.
2. Create a Puja record at `/pujas`, then select it in the top bar.
3. Create reusable categories at `/budget-items`, then plan the selected Puja's spending at `/budget`.
4. Record contributions, para collections, sponsors, and expenses throughout preparation.
5. Add events, participants, prizes, and tasks; track supplies on `/inventory`.
6. Review the dashboard as the event progresses.

Pages that depend on the selected Puja may not show Puja data until a Puja exists and is selected. Some operations pages currently use shared rather than Puja-specific collections; see [Data organization and known mismatch](#data-organization-and-known-mismatch).

## Roles and interface access

Member records use one of these database roles: President, Vice President, Manager, Vice Manager, or Member. [`lib/roles.js`](./lib/roles.js) maps them to internal levels:

| Member role | App level | Intended interface access |
| --- | --- | --- |
| President, Vice President | Super Admin | Manage members, Pujas, pending requests, budget, expenses, and contributions |
| Manager, Vice Manager | Admin | Manage budget, expenses, and contributions |
| Member | User | Use pages made available to general members |

The sidebar hides some links according to the user's role. Pages also control their own buttons, and the restrictions are not consistent across all operations. These roles affect the browser interface only; they do not secure Firestore. See [`ROLE_SYSTEM.md`](./ROLE_SYSTEM.md) for the role mapping and intended permissions.

## Data organization and known mismatch

### Where application data lives

Firestore is the shared record store. [`lib/firebase.js`](./lib/firebase.js) declares base collection names and provides helpers for adding, updating, deleting, and subscribing to documents. Most document creation through `addDocument` adds ISO-string `createdAt` and `updatedAt` values; updates refresh `updatedAt`.

The app uses both shared collections and collections whose names include the Puja ID:

| Records | Collection convention in the current app |
| --- | --- |
| Members, pending members, Pujas, budget items | Shared base collection (for example, `members`) |
| Contributions, para collections, expenses, budget allocations | Puja-specific collection (for example, `contributions_<pujaId>`) |
| Events, participants, prizes, tasks, volunteers, inventory, sponsors | Feature pages use base collections (for example, `events`); dashboard subscriptions use Puja-suffixed collections (for example, `events_<pujaId>`) |

### Known dashboard inconsistency

The dashboard and the event, task, inventory, and sponsor management pages currently use different collection names. For example, the dashboard reads `tasks_<pujaId>`, while the tasks page reads `tasks`. Changes made on those pages may therefore be missing from the dashboard's corresponding summaries. The same issue affects events, inventory, and sponsors.

Before changing collection behavior, inspect both the management page and [`app/page.js`](./app/page.js), and plan for existing Firestore data. Renaming a collection does not move its existing documents.

### State and synchronization

- [`contexts/PujaContext.js`](./contexts/PujaContext.js) loads Puja records, handles selection and changes, and remembers the selected Puja in localStorage.
- [`contexts/AuthContext.js`](./contexts/AuthContext.js) loads the current user from localStorage and provides browser-side role helpers.
- [`store/useStore.js`](./store/useStore.js) holds records in memory while the app is running and calculates dashboard totals.
- Pages subscribe to Firestore when they load and should unsubscribe when they unmount or switch collections.
- The Zustand store is not persistent storage. Firestore is the shared record source; browser localStorage stores the current user and selected Puja.

Some pages create or update fields directly rather than using the shared helper consistently. Treat the forms and actual reads/writes as the source of truth for a record's fields; the examples below are illustrative, not strict schemas.

### Example records

```js
// Puja
{ name: "Annual Puja", year: 2026, status: "active" }

// Member
{ name: "Example Member", role: "Member", contact: "1234567890", email: "member@example.com" }

// Budget item (shared category) and Puja allocation (Puja-specific)
{ name: "Lighting", description: "Pandal and stage lighting" }
{ pujaId: "firestore-puja-id", budgetItemId: "firestore-budget-item-id", allocatedAmount: 50000 }

// Contribution and expense
{ pujaId: "firestore-puja-id", memberId: "firestore-member-id", amount: 5000, notes: "Received" }
{ pujaId: "firestore-puja-id", description: "Puja materials", amount: 2500, category: "Materials" }
```

Other records (tasks, inventory, sponsors, events, participants, and prizes) have page-specific fields. Check the relevant form and write handler before changing their shape.

## Security limitations

**The current authentication implementation is not suitable for protecting production or sensitive data.**

- Login looks up a member in Firestore by email or contact number and compares the submitted password with the stored value. Signup and approval currently store passwords in Firestore as plaintext.
- The current user and role are stored in editable browser localStorage. Route guards and role permissions are client-side UI controls, not server-side or Firestore authorization.
- The login page contains a hard-coded mock super-admin fallback.
- The app uses the Firebase client SDK but does not establish a Firebase Authentication session. Firestore rules that rely on `request.auth` do not authenticate the app's custom login.
- Some feature-page actions are not consistently restricted by role.

Do not store real member passwords in Firestore, use open Firestore rules, or rely on hidden buttons as a security boundary. Before production use, replace the custom password flow and mock account with a secure authentication design, enforce authorization in Firestore rules and trusted server-side code as appropriate, and remove fallback credentials/configuration.

Firebase web configuration is included in client-side app code; it is not a server secret and is not a substitute for database rules. Never put server credentials or private secrets in `NEXT_PUBLIC_*` variables.

## Developer and AI-agent guide

### Start here

| If you are changing... | First inspect... |
| --- | --- |
| A route or page workflow | Its `app/.../page.js` file |
| Shared navigation or the protected shell | `app/(protected)/layout.js`, `components/LayoutWrapper.js`, `components/Sidebar.js`, `components/TopBar.js` |
| Login, signup, or session behavior | `app/login/page.js`, `app/signup/page.js`, `contexts/AuthContext.js`, `components/ProtectedRoute.js` |
| Puja selection or Puja lifecycle | `contexts/PujaContext.js`, `app/(protected)/pujas/page.js`, `components/TopBar.js` |
| Firestore reads, writes, or collection names | `lib/firebase.js`, then every page that reads or writes the affected collection |
| Dashboard totals | `app/page.js`, `store/useStore.js`, and the contributing feature pages |
| Roles and visible actions | `lib/roles.js`, `components/Sidebar.js`, and the target page's permission checks |
| Styling | `app/globals.css`, `components/`, and `tailwind.config.js` |

### Important repository conventions

- The active application routes are in the root `app/` directory. `src/app/` is separate starter content; do not assume it powers the running app.
- Feature pages are client components and generally subscribe to Firestore in `useEffect`, update the Zustand store, and unsubscribe on cleanup.
- Financial pages such as contributions, para collections, expenses, and budget allocations use the selected Puja ID in their collection names.
- Before changing a field, collection, or permission, search for every page and calculation that consumes it. Firestore data may already exist outside the codebase.
- Do not assume a hidden UI control enforces authorization. The current role system is for interface behavior only.
- Supporting Firebase setup and troubleshooting documents may contain older recommendations. Verify advice against the active code and current Firestore collection conventions.

### Validate changes

Run the smallest relevant check, then use the project scripts as needed:

```bash
npm run lint
npm run build
```

There is no configured automated test suite at present. For data changes, verify the read, create, update, and delete paths, Puja switching behavior, dashboard calculations, and Firestore collection names.

## Deployment

The app can be deployed on a platform that supports Next.js, such as Vercel. Configure the `NEXT_PUBLIC_FIREBASE_*` variables in the hosting provider's environment settings and do not commit `.env.local`. Before deploying for real users, resolve the authentication and authorization concerns above and test Firestore rules against the collections the application actually uses.

## Troubleshooting

- **Firebase configuration errors:** Check the `NEXT_PUBLIC_FIREBASE_*` values and restart the development server after changing `.env.local`.
- **Firestore permission errors:** Review the deployed rules and the collection used by the affected page. Custom app login does not create a Firebase Auth identity.
- **Data missing from the dashboard:** Compare the collection read by the dashboard with the one written by the feature page; the known naming mismatch is described above.
- **Puja-specific page is empty:** Confirm a Puja exists and is selected in the top bar.
- **Lint or build failures:** Run `npm run lint` or `npm run build` and inspect the reported file and line.

Do not resolve a Firestore permission error by allowing everyone to read and write the database.

## Related documentation

- [Firebase setup notes](./FIREBASE_SETUP.md)
- [Firestore rules troubleshooting](./FIRESTORE_RULES_FIX.md)
- [Firebase debugging notes](./FIREBASE_DEBUG.md)
- [Role system notes](./ROLE_SYSTEM.md)

## Contributing

1. Create a branch for your change.
2. Make a focused change that follows the existing project structure.
3. Run `npm run lint` and, for application changes, `npm run build`.
4. Describe behavior changes and any Firebase setup or data implications in your pull request.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Lucide](https://lucide.dev/)
