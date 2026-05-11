import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-violet-600 text-white font-bold text-sm flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 pb-10 border-b border-zinc-800 last:border-0">
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <div className="text-zinc-400 text-sm leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-zinc-800 text-violet-300 px-1.5 py-0.5 rounded text-xs font-mono">
      {children}
    </code>
  );
}

function Block({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm font-mono text-zinc-300 overflow-x-auto">
      {children}
    </pre>
  );
}

function ApiCard({
  name,
  color,
  what,
  why,
  where,
  free,
}: {
  name: string;
  color: string;
  what: string;
  why: string;
  where: string;
  free: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-bold ${color}`}>{name}</span>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{free}</span>
      </div>
      <p className="text-sm text-zinc-300 mb-1"><span className="text-zinc-500">What it is: </span>{what}</p>
      <p className="text-sm text-zinc-300 mb-1"><span className="text-zinc-500">Used for: </span>{why}</p>
      <p className="text-sm text-zinc-300"><span className="text-zinc-500">Get keys at: </span>{where}</p>
    </div>
  );
}

function Section({ id, title, emoji, children }: { id: string; title: string; emoji: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 h-14 flex items-center px-6 gap-6 sticky top-0 bg-zinc-950/90 backdrop-blur z-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Origo
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-zinc-400">
          <a href="#setup" className="hover:text-white transition-colors">Setup</a>
          <a href="#running" className="hover:text-white transition-colors">Running locally</a>
          <a href="#apis" className="hover:text-white transition-colors">APIs</a>
          <a href="#deploy" className="hover:text-white transition-colors">Deploy</a>
        </nav>
        <div className="ml-auto">
          <Link href="/new" className="text-sm bg-violet-600 hover:bg-violet-700 text-white px-4 py-1.5 rounded-lg transition-colors">
            Generate a project
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 text-xs text-violet-400 bg-violet-950/50 border border-violet-800/40 rounded-full px-3 py-1 mb-5">
            Complete beginner guide
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            From ZIP file to live website — step by step
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            You downloaded your project. Now what? This guide walks you through everything — installing the tools, connecting your services, running it on your computer, and publishing it to the internet. No experience required.
          </p>
        </div>

        {/* Table of contents */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-14">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">In this guide</p>
          <div className="space-y-2">
            {[
              ["#setup", "1. Install the tools you need"],
              ["#unzip", "2. Open your project"],
              ["#env", "3. Set up your environment variables"],
              ["#running", "4. Run the project on your computer"],
              ["#apis", "5. APIs explained — what they are & how to connect them"],
              ["#deploy", "6. Publish your website to the internet"],
              ["#editing", "7. Editing your project"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors group">
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-400" />
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Section 1 — Setup */}
        <Section id="setup" emoji="🛠️" title="Install the tools you need">
          <div className="space-y-6">
            <Step n={1} title="Install Node.js">
              <p>
                Node.js is the engine that runs your project. Think of it like a translator that turns your code into something the computer understands.
              </p>
              <p>
                Go to <span className="text-violet-300">nodejs.org</span> and download the version labelled <strong className="text-white">LTS</strong> (Long Term Support). Install it like any normal program.
              </p>
              <p>To confirm it installed correctly, open a terminal and type:</p>
              <Block>node --version</Block>
              <p>You should see something like <Code>v20.11.0</Code>. Any version above 18 is fine.</p>
            </Step>

            <Step n={2} title="Install Visual Studio Code (VS Code)">
              <p>
                VS Code is a free code editor made by Microsoft. It&apos;s where you&apos;ll read and edit all the files in your project.
              </p>
              <p>
                Download it at <span className="text-violet-300">code.visualstudio.com</span>. Install it like a normal app.
              </p>
              <p>
                Once installed, open VS Code. You&apos;ll see a welcome screen — you can ignore it for now.
              </p>
            </Step>

            <Step n={3} title="Open a terminal">
              <p>
                A terminal (also called a command line) lets you type commands to control your computer. You&apos;ll use it to install packages and start your project.
              </p>
              <p>
                The easiest way: inside VS Code, go to the top menu → <strong className="text-white">Terminal</strong> → <strong className="text-white">New Terminal</strong>. A panel will open at the bottom of the screen.
              </p>
              <p className="text-zinc-500 text-xs">
                Alternatively: on Mac, use Spotlight (⌘ Space) and search "Terminal". On Windows, search for "Command Prompt" or "PowerShell" in the Start menu.
              </p>
            </Step>
          </div>
        </Section>

        {/* Section 2 — Open project */}
        <Section id="unzip" emoji="📦" title="Open your project">
          <div className="space-y-6">
            <Step n={1} title="Unzip your download">
              <p>
                Find the ZIP file you downloaded from Origo (it&apos;s named after your project). Double-click it to extract the folder inside.
              </p>
              <p>
                Move the extracted folder somewhere easy to find — like your Desktop or a <Code>projects</Code> folder in your Documents.
              </p>
            </Step>

            <Step n={2} title="Open the folder in VS Code">
              <p>
                In VS Code, go to <strong className="text-white">File</strong> → <strong className="text-white">Open Folder</strong>, then select the folder you just extracted. You&apos;ll see all the project files appear in the left sidebar.
              </p>
              <p>Don&apos;t worry if you see lots of files — that&apos;s normal. The main ones to know about:</p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono space-y-1">
                <p><span className="text-violet-300">src/app/</span> <span className="text-zinc-500">← all your pages live here</span></p>
                <p><span className="text-violet-300">src/components/</span> <span className="text-zinc-500">← reusable UI pieces</span></p>
                <p><span className="text-violet-300">src/lib/</span> <span className="text-zinc-500">← connections to services (database, email, etc.)</span></p>
                <p><span className="text-violet-300">.env.example</span> <span className="text-zinc-500">← list of settings you need to fill in</span></p>
                <p><span className="text-violet-300">package.json</span> <span className="text-zinc-500">← list of all the packages your project uses</span></p>
              </div>
            </Step>

            <Step n={3} title="Install the project's packages">
              <p>
                Your project uses dozens of pre-built packages (like building blocks). You need to download them once. In your terminal, make sure you&apos;re inside the project folder:
              </p>
              <Block>cd path/to/your-project-folder</Block>
              <p>Then run:</p>
              <Block>npm install</Block>
              <p>
                This will take 1–2 minutes. You&apos;ll see a lot of text scrolling — that&apos;s normal. When it stops, you&apos;re ready.
              </p>
            </Step>
          </div>
        </Section>

        {/* Section 3 — Env vars */}
        <Section id="env" emoji="🔑" title="Set up your environment variables">
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Environment variables are secret settings your app needs to connect to services like your database, payment provider, or email sender. They&apos;re kept in a special file called <Code>.env.local</Code> that never gets shared publicly.
          </p>
          <div className="space-y-6">
            <Step n={1} title='Create your .env.local file'>
              <p>
                Your project includes a file called <Code>.env.example</Code> — this is a template showing every variable you need. You need to copy it and fill in the real values.
              </p>
              <p>In your terminal, run:</p>
              <Block>cp .env.example .env.local</Block>
              <p>
                Now open <Code>.env.local</Code> in VS Code. You&apos;ll see lots of lines like <Code>STRIPE_SECRET_KEY=</Code>. You need to fill in the value after each <Code>=</Code> sign.
              </p>
            </Step>

            <Step n={2} title="Fill in only what you need">
              <p>
                You don&apos;t need to fill in every variable right away. Start with the ones your project actually uses — those are the ones listed in your <Code>.env.example</Code>.
              </p>
              <p>
                The next section explains each service and exactly where to get the keys. Keep your <Code>.env.local</Code> open as you go through them.
              </p>
              <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-sm text-amber-200">
                ⚠️ <strong>Never share your .env.local file.</strong> It contains secret keys. Never paste them in a chat, commit them to GitHub, or share them publicly.
              </div>
            </Step>
          </div>
        </Section>

        {/* Section 4 — Running */}
        <Section id="running" emoji="💻" title="Run the project on your computer">
          <div className="space-y-6">
            <Step n={1} title="Start the development server">
              <p>Once your <Code>.env.local</Code> has at least the required variables filled in, run:</p>
              <Block>npm run dev</Block>
              <p>
                You&apos;ll see some output ending with something like <Code>Local: http://localhost:3000</Code>. Open that URL in your browser.
              </p>
              <p>
                🎉 Your website is running! Every time you save a file in VS Code, the browser will automatically refresh with your changes.
              </p>
            </Step>

            <Step n={2} title="If something goes wrong">
              <p>
                Read the error message in the terminal carefully — it usually tells you exactly what&apos;s missing. Common issues:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li><span className="text-white">Missing environment variable</span> — fill it in your <Code>.env.local</Code></li>
                <li><span className="text-white">Module not found</span> — run <Code>npm install</Code> again</li>
                <li><span className="text-white">Port already in use</span> — another app is on port 3000, run <Code>npm run dev -- -p 3001</Code></li>
              </ul>
            </Step>
          </div>
        </Section>

        {/* Section 5 — APIs */}
        <Section id="apis" emoji="🔌" title="APIs explained — what they are & how to connect them">
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            An API is a service you connect to from your project. Instead of building a database or payment system from scratch, you use a specialist service and connect to it with a secret key — like a password for your app to talk to theirs.
          </p>

          <div className="grid gap-4 mb-10">
            <ApiCard
              name="Supabase"
              color="text-emerald-400"
              what="A database + user login system in the cloud. It stores all your app's data."
              why="User accounts, storing content, querying data"
              where="supabase.com → Create project → Project Settings → API"
              free="Free tier available"
            />
            <ApiCard
              name="Stripe"
              color="text-blue-400"
              what="The most popular payment processor. Handles credit cards securely so you don't have to."
              why="Accepting payments, subscriptions, invoices"
              where="dashboard.stripe.com → Developers → API keys"
              free="Free, Stripe takes a % per transaction"
            />
            <ApiCard
              name="Clerk"
              color="text-violet-400"
              what="A drop-in login & signup system with a beautiful UI already built for you."
              why="User authentication (sign up, sign in, profiles)"
              where="dashboard.clerk.com → Your app → API Keys"
              free="Free up to 10,000 monthly active users"
            />
            <ApiCard
              name="Resend"
              color="text-orange-400"
              what="A service for sending emails from your app (like welcome emails, password resets)."
              why="Transactional emails sent from your own domain"
              where="resend.com → API Keys → Create API Key"
              free="3,000 emails/month free"
            />
            <ApiCard
              name="Cloudinary"
              color="text-yellow-400"
              what="Cloud storage for images and videos with automatic resizing and optimisation."
              why="Profile pictures, product images, media uploads"
              where="cloudinary.com → Dashboard → API Keys"
              free="25GB storage free"
            />
            <ApiCard
              name="OpenAI"
              color="text-teal-400"
              what="The company behind ChatGPT. You can use their AI in your own app."
              why="AI chat, text generation, summarisation"
              where="platform.openai.com → API Keys → Create new secret key"
              free="Pay per use, starts at ~$0.002 per message"
            />
            <ApiCard
              name="Anthropic"
              color="text-red-400"
              what="The company that makes Claude (the AI that generated your project). Use it for AI features."
              why="AI chat, code generation, document analysis"
              where="console.anthropic.com → Settings → API Keys"
              free="Pay per use"
            />
            <ApiCard
              name="Mapbox"
              color="text-cyan-400"
              what="Interactive maps you can embed in your site — like Google Maps but more customisable."
              why="Location pickers, store finders, delivery maps"
              where="account.mapbox.com → Access Tokens"
              free="50,000 map loads/month free"
            />
            <ApiCard
              name="Pusher"
              color="text-pink-400"
              what="Real-time messaging — lets your app update instantly without the user refreshing."
              why="Live chat, notifications, collaborative features"
              where="dashboard.pusher.com → Your app → App Keys"
              free="200 connections free"
            />
            <ApiCard
              name="Algolia"
              color="text-indigo-400"
              what="A search service that makes search incredibly fast and accurate."
              why="Site search, product search, filtering"
              where="dashboard.algolia.com → Settings → API Keys"
              free="10,000 searches/month free"
            />
          </div>

          <div className="space-y-6">
            <Step n={1} title="Sign up for the services your project uses">
              <p>
                Look at your <Code>.env.example</Code> — only fill in the services listed there. If you see <Code>STRIPE_SECRET_KEY=</Code>, you need Stripe. If you don&apos;t see it, you don&apos;t need it.
              </p>
              <p>
                Most services have a free tier — you won&apos;t need to pay anything to get started.
              </p>
            </Step>

            <Step n={2} title="Paste each key into your .env.local">
              <p>
                After signing up for a service and finding your API key, copy it and paste it after the <Code>=</Code> sign in your <Code>.env.local</Code>. For example:
              </p>
              <Block>{`# Before
STRIPE_SECRET_KEY=

# After
STRIPE_SECRET_KEY=sk_test_AbCdEfGhIjKlMnOpQrStUv...`}</Block>
              <p>
                Save the file, then restart your dev server (<Code>Ctrl+C</Code> to stop it, then <Code>npm run dev</Code> again).
              </p>
            </Step>

            <Step n={3} title="For Supabase — also run the database schema">
              <p>
                If your project uses Supabase, you need to create the database tables. Your project includes a file called <Code>supabase/schema.sql</Code>.
              </p>
              <p>Steps:</p>
              <ul className="list-decimal list-inside space-y-1 ml-1">
                <li>Go to your project on <span className="text-violet-300">supabase.com</span></li>
                <li>Click <strong className="text-white">SQL Editor</strong> in the left sidebar</li>
                <li>Click <strong className="text-white">New Query</strong></li>
                <li>Open <Code>supabase/schema.sql</Code> in VS Code, select all the text (<Code>Ctrl+A</Code>), copy it</li>
                <li>Paste it into the SQL Editor and click <strong className="text-white">Run</strong></li>
              </ul>
              <p>This creates all the tables your app needs. You only need to do this once.</p>
            </Step>
          </div>
        </Section>

        {/* Section 6 — Deploy */}
        <Section id="deploy" emoji="🚀" title="Publish your website to the internet">
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Running on your computer is great for building, but to share it with the world you need to deploy it. Vercel is the easiest way — it was made by the same team as Next.js (the framework your project uses).
          </p>
          <div className="space-y-6">
            <Step n={1} title="Push your code to GitHub">
              <p>
                Vercel deploys from GitHub. If you&apos;ve never used GitHub before, it&apos;s a website where you store and share your code.
              </p>
              <p>
                Sign up at <span className="text-violet-300">github.com</span>, create a new repository, then follow GitHub&apos;s instructions to push your project folder to it.
              </p>
            </Step>

            <Step n={2} title="Connect to Vercel">
              <p>
                Go to <span className="text-violet-300">vercel.com</span> and sign up with your GitHub account. Click <strong className="text-white">Add New Project</strong> and select your repository.
              </p>
              <p>
                Vercel will automatically detect that it&apos;s a Next.js project and configure everything for you.
              </p>
            </Step>

            <Step n={3} title="Add your environment variables to Vercel">
              <p>
                Before clicking Deploy, you need to add your API keys to Vercel. On the deployment screen, look for <strong className="text-white">Environment Variables</strong>. Add every key from your <Code>.env.local</Code> file here — one by one.
              </p>
              <p className="text-zinc-500">
                Tip: You can also do this later via Project Settings → Environment Variables and then redeploy.
              </p>
            </Step>

            <Step n={4} title="Deploy!">
              <p>
                Click <strong className="text-white">Deploy</strong>. Vercel will build your project (takes about 1–2 minutes) and give you a URL like <Code>your-project.vercel.app</Code>.
              </p>
              <p>
                Every time you push new code to GitHub, Vercel will automatically rebuild and update your live site.
              </p>
            </Step>

            <Step n={5} title="Add a custom domain (optional)">
              <p>
                If you have a domain (like <Code>yoursite.com</Code>), go to your Vercel project → <strong className="text-white">Settings</strong> → <strong className="text-white">Domains</strong> and add it. Vercel will give you DNS instructions to follow with your domain registrar.
              </p>
            </Step>
          </div>
        </Section>

        {/* Section 7 — Editing */}
        <Section id="editing" emoji="✏️" title="Editing your project">
          <div className="space-y-6">
            <Step n={1} title="Find the file you want to change">
              <p>
                All pages are in the <Code>src/app/</Code> folder. Each folder is a URL path:
              </p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono space-y-1">
                <p><span className="text-violet-300">src/app/page.tsx</span> <span className="text-zinc-500">← your homepage (yoursite.com/)</span></p>
                <p><span className="text-violet-300">src/app/about/page.tsx</span> <span className="text-zinc-500">← yoursite.com/about</span></p>
                <p><span className="text-violet-300">src/app/blog/page.tsx</span> <span className="text-zinc-500">← yoursite.com/blog</span></p>
              </div>
            </Step>

            <Step n={2} title="Edit text and styling">
              <p>
                Open any <Code>.tsx</Code> file in VS Code. It looks like HTML mixed with JavaScript. To change text, find it in the file and type your new text. To change colours or spacing, edit the Tailwind class names (things like <Code>text-blue-500</Code> or <Code>p-4</Code>).
              </p>
              <p>
                Save the file (<Code>Ctrl+S</Code>) and your browser will automatically refresh.
              </p>
            </Step>

            <Step n={3} title="Don't know how to do something? Ask AI">
              <p>
                If you want to change something but don&apos;t know how to code it, copy the relevant file&apos;s content and paste it into Claude or ChatGPT with a message like:
              </p>
              <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-300 italic">
                &ldquo;Here is my React component. Please change the hero headline to say &apos;Welcome to my shop&apos; and make the background dark blue instead of white.&rdquo;
              </div>
              <p>
                Paste the updated code back into your file. AI is excellent at small targeted edits like this.
              </p>
            </Step>
          </div>
        </Section>

        {/* Bottom CTA */}
        <div className="bg-violet-950/30 border border-violet-800/30 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to build?</h3>
          <p className="text-zinc-400 text-sm mb-6">
            Answer 10 questions and get a complete, ready-to-run starter project in minutes.
          </p>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <Zap className="w-4 h-4" />
            Generate your project
          </Link>
        </div>
      </div>
    </div>
  );
}
