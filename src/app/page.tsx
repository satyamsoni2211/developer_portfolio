"use client";

import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Mail,
  Globe,
  Phone,
  ArrowDown,
  ExternalLink,
} from "lucide-react";

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/satyamsoni2211",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/-satyamsoni",
    icon: Linkedin,
  },
  {
    label: "Personal Site",
    href: "https://satyamsoni.in",
    icon: Globe,
  },
  {
    label: "Email",
    href: "mailto:satyamsoni@hotmail.co.uk",
    icon: Mail,
  },
];

const experience = [
  {
    role: "Technical Architect – Real Estate & Finance",
    company: "SenecaGlobal Solutions Pvt Ltd.",
    location: "Hyderabad, Telangana",
    period: "Jan 2022 – Present",
    highlights: [
      "Architecting microservices with FastAPI / Flask on AWS to enable scalable, data-centric platforms.",
      "Designed Airflow-based ETL workflows for multi-vendor ingestion with strong data quality guarantees.",
      "Built “Fusion”, an AI chatbot using GraphRAG + LLMs for real estate queries, improving client engagement.",
      "Implemented micro-frontend & microservice-based suite with Docker & ECS to improve performance and deployments.",
      "Led a 10+ developer team, driving sprint planning, code reviews, and high-quality delivery.",
    ],
  },
  {
    role: "Senior Software Engineer – Finance, R&D",
    company: "HSBC Software Development (India) Pvt. Ltd.",
    location: "Pune, Maharashtra",
    period: "Jan 2020 – Jan 2022",
    highlights: [
      "Built full-stack solutions with Django / Flask / React and ECS for containerized deployments.",
      "Developed Golang microservices for automation, boosting performance and reliability.",
      "Designed fault-tolerant cloud-native architectures on AWS and mentored junior developers.",
    ],
  },
  {
    role: "Associate Consultant – Investment Banking",
    company: "Infosys Ltd",
    location: "Pune, Maharashtra",
    period: "Jan 2019 – Dec 2019",
    highlights: [
      "Developed full-stack Python + React apps to enhance data processing in investment banking systems.",
      "Implemented ML pipelines & automated backend testing for higher quality releases.",
    ],
  },
  {
    role: "Front End Developer – Telecom",
    company: "Amdocs Development Centre India LLP",
    location: "Pune, Maharashtra",
    period: "Aug 2018 – Jan 2019",
    highlights: [
      "Crafted reusable React components integrated with Python REST APIs.",
      "Improved frontend performance with optimized React patterns and testing.",
    ],
  },
  {
    role: "ETL DevOps Developer – Finance/Banking",
    company: "Gemini Solutions Pvt Ltd.",
    location: "Gurugram, Haryana",
    period: "Jul 2016 – Apr 2018",
    highlights: [
      "Automated ETL pipelines in Python & Shell, reducing manual data handling.",
      "Built Python frameworks for validation, scraping, and data workflows.",
    ],
  },
];

const projects = [
  {
    name: "Fusion – Real Estate AI Chatbot",
    org: "SenecaGlobal",
    description:
      "AI-powered chatbot using GraphRAG and entity disambiguation to convert natural queries into Cypher and fetch accurate real estate insights.",
    impact: [
      "25% increase in response accuracy",
      "30% faster query resolution",
      "20% uplift in client retention",
    ],
    tags: ["GraphRAG", "LLMs", "Neo4j / Cypher", "FastAPI", "GenAI"],
  },
  {
    name: "HTML Parser & Extractor",
    org: "SenecaGlobal",
    description:
      "Python tools using GPT-4-class LLMs to parse and extract structured data from diverse HTML sources.",
    impact: [
      "30% faster data processing",
      "40% reduction in manual extraction",
      "Deployed to 15+ client projects",
    ],
    tags: ["Python", "LLMs", "Data Extraction", "Automation"],
  },
  {
    name: "Centralized Utility Framework",
    org: "SenecaGlobal",
    description:
      "Python-based framework for logging, Terraform, Docker, and notifications to streamline deployments.",
    impact: [
      "40% downtime reduction via observability",
      "30% faster deployments",
    ],
    tags: ["Python", "Terraform", "Docker", "DevOps"],
  },
  {
    name: "Automatic Certificate Renewal",
    org: "HSBC",
    description:
      "Django tool plus Golang microservice to automatically track and renew certificates.",
    impact: [
      "70% fewer manual interventions",
      "Higher security and reliability",
    ],
    tags: ["Django", "Golang", "AWS", "Security Automation"],
  },
];

const skills = {
  Programming: [
    "Python",
    "Golang",
    "C#",
    "TypeScript",
    "Node.js",
    "Shell",
    "SQL",
    "HTML/CSS",
    "JavaScript",
    "Rust",
  ],
  "Frameworks & Libraries": [
    "Django",
    "FastAPI",
    "Flask",
    "PySpark",
    "React",
    "Angular",
    "Vue",
    "LangChain",
    "PyTorch",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "gRPC",
    ".NET Core",
  ],
  "Cloud & Data": [
    "AWS (EC2, S3, RDS, Lambda, MWAA)",
    "MySQL",
    "MongoDB",
    "PostgreSQL",
  ],
  "DevOps & Infra": [
    "Docker",
    "Kubernetes",
    "Terraform",
    "Airflow",
    "ElasticSearch",
    "Redis",
  ],
  Collaboration: ["Git", "Bitbucket", "JIRA", "Confluence"],
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Header />
        <Hero />
        <motion.section
          id="about"
          className="mt-24 lg:mt-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          variants={sectionVariants}
        >
          <SectionLabel label="About" />
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr,1fr] items-start">
            <div className="rounded-xl2 bg-white/70 backdrop-blur-xl shadow-soft border border-white/40 px-6 py-6 sm:px-8 sm:py-8">
              <p className="text-lg leading-relaxed text-slate-800">
                I&apos;m <span className="font-semibold">Satyam Soni</span>, a{" "}
                <span className="font-semibold">
                  Technical Architect & AI-focused Engineer
                </span>{" "}
                with 9+ years of experience building data-centric platforms, ETL
                pipelines, and cloud-native products across finance, telecom,
                and real estate.
              </p>
              <p className="mt-4 text-slate-700">
                I specialize in using{" "}
                <span className="font-medium">
                  LLMs and modern Python stacks
                </span>{" "}
                to automate, scale, and de-risk complex workflows – from
                AI-driven chatbots to microservice-based tool suites. I enjoy
                designing systems that feel simple on the surface but hide
                serious engineering and rigor underneath.
              </p>
              <p className="mt-4 text-slate-700">
                I thrive in architect roles where I can collaborate with
                engineers, product, and stakeholders to turn loosely defined
                problems into resilient, observable, and evolvable systems.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <ContactCard />
              <QuickStats />
            </div>
          </div>
        </motion.section>

        <AnimatedSection id="experience" label="Experience">
          <div className="space-y-6">
            {experience.map((job) => (
              <motion.article
                key={job.role + job.company}
                className="group rounded-xl2 border border-slate-200/70 bg-white/70 backdrop-blur-xl px-6 py-6 sm:px-8 sm:py-7 shadow-soft hover:-translate-y-1 hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                      {job.role}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {job.period}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm sm:text-[0.94rem] text-slate-700">
                  {job.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-1 h-[6px] w-[6px] rounded-full bg-slate-400 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection id="projects" label="Selected Work">
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <motion.div
                key={project.name}
                className="group rounded-xl2 border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-soft hover:shadow-xl hover:-translate-y-1 transition-all"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                      {project.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {project.org}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200/80 bg-surface px-3 py-1 text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.12em] text-slate-600">
                    Live system
                  </span>
                </div>
                <p className="mt-3 text-sm sm:text-[0.95rem] leading-relaxed text-slate-700">
                  {project.description}
                </p>
                <ul className="mt-3 space-y-1.5 text-xs sm:text-[0.8rem] text-slate-600">
                  {project.impact.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[5px] h-[4px] w-[4px] rounded-full bg-slate-400 flex-shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-accent.soft/40 px-3 py-1 text-xs text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection id="skills" label="Skills">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(skills).map(([category, items]) => (
              <motion.div
                key={category}
                className="rounded-xl2 border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 shadow-soft"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35 }}
              >
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                  {category}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-200/80 bg-surface px-3 py-1 text-[0.75rem] text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection id="contact" label="Contact">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
            <div className="rounded-xl2 border border-slate-200/70 bg-white/80 backdrop-blur-xl p-6 sm:p-8 shadow-soft">
              <h3 className="text-lg font-semibold tracking-tight">
                Let&apos;s build something meaningful.
              </h3>
              <p className="mt-2 text-sm sm:text-[0.95rem] text-slate-700">
                I&apos;m open to roles and projects in{" "}
                <span className="font-medium">
                  technical architecture, AI / LLM engineering, and platform
                  engineering
                </span>{" "}
                where I can help you design and ship robust, scalable systems.
              </p>
              <form
                className="mt-6 space-y-4"
                action="https://formspree.io/f/xqakvqky"
                method="POST"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      required
                      name="name"
                      className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm outline-none ring-0 focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      name="email"
                      className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                  </Field>
                </div>
                <Field label="Project / Message">
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                  />
                </Field>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-soft transition hover:-translate-y-[1px] hover:shadow-xl active:translate-y-[1px]"
                >
                  Send message
                  <ArrowDown className="h-4 w-4 rotate-90" />
                </button>
              </form>
            </div>
            <div className="space-y-4">
              <ContactCard />
              <SocialLinksCard />
            </div>
          </div>
        </AnimatedSection>

        <footer className="mt-16 border-t border-slate-200/70 pt-6 pb-4 text-xs text-slate-500 flex flex-col sm:flex-row justify-between gap-3">
          <span>© {new Date().getFullYear()} Satyam Soni.</span>
          <span className="flex items-center gap-1">
            Built with Next.js & Tailwind
            <ExternalLink className="h-3 w-3" />
          </span>
        </footer>
      </div>
    </main>
  );
}

function Header() {
  const navItems = [
    { href: "#about", label: "About" },
    { href: "#experience", label: "Experience" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-30 mb-4 bg-gradient-to-b from-surface/95 via-surface/80 to-transparent backdrop-blur-xl">
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-2xl bg-ink text-white text-xs flex items-center justify-center font-semibold">
            SS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              Satyam Soni
            </span>
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
              Technical Architect • AI & Platforms
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative pb-1 hover:text-ink transition"
            >
              {item.label}
              <span className="absolute left-0 -bottom-[2px] h-[1px] w-0 bg-ink transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:-translate-y-[1px] hover:shadow-md transition"
        >
          Get in touch
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-slate-500">
          Technical Architect · AI & LLMs · Cloud Platforms
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-ink">
          I design and build intelligent, scalable systems that feel effortless
          to use.
        </h1>
        <p className="mt-4 text-sm sm:text-[0.98rem] leading-relaxed text-slate-700 max-w-xl">
          From AI chatbots powered by knowledge graphs to microservice and
          micro-frontend suites on AWS, I help teams go from idea to robust,
          observable, and maintainable platforms.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-soft transition hover:-translate-y-[1px] hover:shadow-xl active:translate-y-[1px]"
          >
            Let&apos;s collaborate
            <ArrowDown className="h-4 w-4" />
          </a>
          <a
            href="/satyam_soni.pdf"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-xs sm:text-sm font-medium text-slate-800 hover:-translate-y-[1px] hover:shadow-md transition"
          >
            Download Resume
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1">
            Indore · Hyderabad · Pune · Remote
          </span>
          <span className="rounded-full border border-slate-300 bg-white/80 px-3 py-1">
            Real Estate · Finance · Telecom
          </span>
        </div>
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
      >
        <div className="relative rounded-[1.75rem] border border-slate-200/80 bg-white/80 backdrop-blur-xl p-5 shadow-soft overflow-hidden">
          <div className="absolute -top-20 -right-24 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Current focus
                </p>
                <p className="text-sm font-semibold text-ink">
                  AI-native platforms & microservices
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-surface px-3 py-2 text-right">
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                  Experience
                </p>
                <p className="text-lg font-semibold text-ink">
                  9<span className="text-xs align-super">+ yrs</span>
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface px-3 py-3 text-[0.78rem] text-slate-700">
              <p>Recent work highlights</p>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-emerald-500" />
                  <span>
                    Fusion – GraphRAG + LLM chatbot for real estate clients.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-sky-500" />
                  <span>
                    Micro-frontend suite consolidating multiple tools on AWS.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[5px] h-[6px] w-[6px] rounded-full bg-violet-500" />
                  <span>
                    HTML parsing and extraction framework with GPT models.
                  </span>
                </li>
              </ul>
            </div>
            <SocialRow />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="section-label text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
      <span>{label}</span>
    </div>
  );
}

function AnimatedSection({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      className="mt-20 lg:mt-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      variants={sectionVariants}
    >
      <SectionLabel label={label} />
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function ContactCard() {
  return (
    <div className="rounded-xl2 border border-slate-200/80 bg-white/80 backdrop-blur-xl p-4 shadow-soft text-xs sm:text-sm text-slate-700">
      <p className="font-semibold text-slate-900">Direct contact</p>
      <div className="mt-2 space-y-1.5">
        <a
          href="mailto:satyamsoni@hotmail.co.uk"
          className="flex items-center gap-2 hover:text-ink transition"
        >
          <Mail className="h-4 w-4" />
          <span>satyamsoni@hotmail.co.uk</span>
        </a>
        <a
          href="tel:+917697066634"
          className="flex items-center gap-2 hover:text-ink transition"
        >
          <Phone className="h-4 w-4" />
          <span>+91 7697066634</span>
        </a>
      </div>
    </div>
  );
}

function SocialRow() {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.75rem] text-slate-600">
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3 py-1 hover:-translate-y-[1px] hover:shadow-md transition"
        >
          <s.icon className="h-3.5 w-3.5" />
          <span>{s.label}</span>
        </a>
      ))}
    </div>
  );
}

function SocialLinksCard() {
  return (
    <div className="rounded-xl2 border border-slate-200/80 bg-white/80 backdrop-blur-xl p-4 shadow-soft text-xs sm:text-sm text-slate-700">
      <p className="font-semibold text-slate-900">Connect with me</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-surface px-3 py-1.5 hover:-translate-y-[1px] hover:shadow-md transition"
          >
            <s.icon className="h-3.5 w-3.5" />
            <span>{s.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function QuickStats() {
  const stats = [
    { label: "Industry domains", value: "Finance, Real Estate, Telecom" },
    { label: "Cloud & data", value: "AWS · ETL · Data Platforms" },
    { label: "AI & automation", value: "LLMs · GraphRAG · ML Pipelines" },
  ];
  return (
    <div className="rounded-xl2 border border-slate-200/80 bg-white/80 backdrop-blur-xl p-4 shadow-soft text-xs sm:text-sm text-slate-700">
      <p className="font-semibold text-slate-900">What I work with</p>
      <ul className="mt-2 space-y-1.5">
        {stats.map((s) => (
          <li key={s.label} className="flex flex-col">
            <span className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
              {s.label}
            </span>
            <span>{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs sm:text-[0.8rem] text-slate-700">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
