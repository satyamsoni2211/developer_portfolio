import { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

// Types
interface Command {
  input: string;
  output: React.ReactNode;
  timestamp: Date;
}

interface Section {
  name: string;
  description: string;
  content: React.ReactNode;
}

// Portfolio Data - Satyam Soni
const PORTFOLIO_DATA = {
  name: 'Satyam Soni',
  role: 'Technical Architect',
  location: 'Indore, Madhya Pradesh',
  email: 'satyamsoni@hotmail.co.uk',
  // phone: '+91-7697066634',
  github: 'https://github.com/satyamsoni2211',
  linkedin: 'https://linkedin.com/in/-satyamsoni',
  website: 'https://satyamsoni.in',
  bio: `Results-driven Technology Specialist with 9+ years of experience delivering data-centric solutions, driving software development, and implementing ETL pipelines and platform integration solutions to unlock scale across the finance, telecom, and real estate industries.

Proven expertise in Artificial Intelligence (AI) and Large Language Models (LLMs), leveraging cutting-edge techniques to develop intelligent solutions. Adept at establishing collaboration frameworks for internal teams, building strong relationships with stakeholders, and recommending process improvements to optimize workflows.

Passionate about innovation and building solutions that empower internal and external stakeholders.`,
  skills: {
    languages: ['Python', 'Golang', 'C#', 'TypeScript', 'NodeJS', 'Shell Scripting', 'SQL'],
    frameworks: ['Django', 'FastAPI', 'Flask', 'PySpark', 'ReactJS', 'Angular', 'Vue.js', '.Net Core', 'Gin', 'Gorm', 'GRPC'],
    ai_ml: ['Scikit-learn', 'NumPy', 'Pandas', 'PyTorch', 'LangChain', 'OpenAI', 'GraphRAG', 'LLM Integration'],
    databases: ['MySQL', 'MongoDB', 'PostgreSQL', 'Elasticsearch', 'Redis'],
    devops: ['Docker', 'Kubernetes', 'Terraform', 'Apache Airflow', 'MWAA', 'Swagger'],
    cloud: ['AWS (EC2, S3, RDS, Lambda)', 'ECS', 'Cloud-Native Architecture'],
    tools: ['GIT', 'BitBucket', 'JIRA', 'Confluence', 'SharePoint'],
    os: ['Windows', 'Linux', 'Unix', 'Mac']
  },
  experience: [
    {
      company: 'SenecaGlobal Solutions Pvt Ltd.',
      location: 'Hyderabad, Telangana',
      role: 'Technical Architect – Real Estate, Finance',
      period: 'Jan 2022 - Present',
      description: 'Led the development and integration of microservices using Python (FastAPI, Flask) on AWS, enhancing platform scalability. Designed ETL workflows using Airflow to ingest data from various vendors. Spearheaded development of "Fusion," an AI-powered chatbot using GraphRAG for knowledge graph interaction. Leveraged GPT-4o to automate content extraction from HTML files, improving efficiency by 50%. Implemented micro-frontend architecture and streamlined deployment using Docker and ECS, reducing deployment time by 30%. Directed sprint planning and provided technical guidance to a team of 10+ developers.',
      technologies: ['Python', 'FastAPI', 'Flask', 'AWS', 'Airflow', 'GraphRAG', 'GPT-4o', 'Docker', 'ECS', 'React', 'Vue.js']
    },
    {
      company: 'HSBC Software Development (India) Pvt. Ltd.',
      location: 'Pune, Maharashtra',
      role: 'Senior Software Engineer – Finance, R&D',
      period: 'Jan 2020 - Jan 2022',
      description: 'Developed scalable Full-Stack solutions using Python (Django, Flask) and ReactJS, deployed on ECS. Built microservices for automation using Golang, boosting performance by 30%. Collaborated with distributed team of 10+ developers using Agile and Kanban. Automated testing and monitoring processes, reducing incidents by 15%. Designed fault-tolerant cloud-native architectures on AWS. Conducted knowledge-sharing sessions on Python automation tools, improving team productivity by 15%.',
      technologies: ['Python', 'Django', 'Flask', 'ReactJS', 'Golang', 'AWS', 'ECS', 'Docker']
    },
    {
      company: 'Infosys Ltd',
      location: 'Pune, Maharashtra',
      role: 'Associate Consultant – Investment Banking, Finance',
      period: 'Jan 2019 - Dec 2019',
      description: 'Built full-stack applications using Python (Django, Flask) and ReactJS, enhancing data processing efficiency by 40%. Developed REST APIs and integrated dynamic frontend components using Angular and React. Created Python-based machine learning pipelines for data analytics. Automated backend testing with Python, reducing bugs in production by 15%.',
      technologies: ['Python', 'Django', 'Flask', 'ReactJS', 'Angular', 'REST APIs', 'Machine Learning']
    },
    {
      company: 'Amdocs Development Centre India LLP',
      location: 'Pune, Maharashtra',
      role: 'Front End Developer – Telecom',
      period: 'Aug 2018 - Jan 2019',
      description: 'Developed reusable ReactJS components and integrated them with Python-based REST APIs (Flask, Django). Enhanced frontend performance by 25% through optimized React development. Conducted frontend testing using Mocha and Chai to ensure high code quality. Collaborated with backend teams to resolve technical issues.',
      technologies: ['ReactJS', 'Flask', 'Django', 'REST APIs', 'Mocha', 'Chai']
    },
    {
      company: 'Gemini Solutions Pvt Ltd.',
      location: 'Gurugram, Haryana',
      role: 'ETL DevOps Developer – Finance/Banking',
      period: 'Jul 2016 - Apr 2018',
      description: 'Automated ETL processes using Python and Shell scripting, reducing manual data handling by 50%. Developed Python frameworks for data validation and scraping. Integrated ETL systems with ReactJS frontends for real-time insights. Optimized data extraction workflows, improving processing times by 30%.',
      technologies: ['Python', 'Shell Scripting', 'ETL', 'ReactJS', 'Data Validation']
    }
  ],
  education: {
    degree: 'Bachelor of Engineering in Computer Science',
    school: 'Chamelidevi School of Engineering',
    location: 'Indore, Madhya Pradesh',
    period: 'Jan 2012 - Jun 2016',
    gpa: '75/100'
  },
  projects: [
    {
      name: 'FUSION',
      company: 'SenecaGlobal Pvt. Ltd.',
      description: 'AI-powered chatbot for real estate queries utilizing GraphRAG and entity disambiguation to resolve queries into Cypher text and generate accurate responses. Increased response accuracy by 25% and decreased query resolution time by 30%, leading to 20% increase in client retention.',
      tech: ['Python', 'GraphRAG', 'LLM', 'Neo4j', 'Cypher', 'FastAPI'],
      github: null,
      demo: null
    },
    {
      name: 'HTML Parser and Extractor',
      company: 'SenecaGlobal Pvt. Ltd.',
      description: 'Python-based tool for parsing and extracting structured data from HTML documents using GPT-4o model. Increased data processing speed by 30% and reduced manual extraction efforts by 40%. Successfully deployed in 15 client projects.',
      tech: ['Python', 'GPT-4o', 'LLM', 'HTML Parsing', 'FastAPI'],
      github: null,
      demo: null
    },
    {
      name: 'Utility Framework',
      company: 'SenecaGlobal Pvt. Ltd.',
      description: 'Centralized Python framework for managing logging, Terraform, Docker, and notifications. Reduced downtime by 40% and increased deployment speed by 30%. Enhanced team collaboration with notification integrations.',
      tech: ['Python', 'Terraform', 'Docker', 'AWS', 'FastAPI'],
      github: null,
      demo: null
    },
    {
      name: 'Vendor Data Ingest',
      company: 'SenecaGlobal Pvt. Ltd.',
      description: 'Automated data ingestion pipeline using Apache Airflow and AWS services, cutting down manual data entry by 60%.',
      tech: ['Python', 'Apache Airflow', 'AWS', 'MWAA', 'ETL'],
      github: null,
      demo: null
    },
    {
      name: 'Tool Suite',
      company: 'SenecaGlobal Pvt. Ltd.',
      description: 'Collection of FastAPI, Vue, and React-based tools consolidated under micro-frontend architecture, improving team collaboration by 30%.',
      tech: ['FastAPI', 'Vue.js', 'React', 'Micro-frontend'],
      github: null,
      demo: null
    },
    {
      name: 'Automatic Certificate Renewal',
      company: 'HSBC',
      description: 'Python Django tool for automatic certificate renewal and server refresh. Reduced manual server interventions by 70%. Golang microservice for periodic certificate assessment and renewal.',
      tech: ['Python', 'Django', 'Golang', 'Microservices', 'Automation'],
      github: null,
      demo: null
    }
  ],
  openSource: [
    {
      repo: 'satyamsoni2211',
      description: 'Personal GitHub profile with various projects and contributions',
      contributions: 'Active contributor'
    }
  ],
  contact: {
    email: 'satyamsoni@hotmail.co.uk',
    // phone: '+91-7697066634',
    linkedin: 'https://linkedin.com/in/-satyamsoni',
    github: 'https://github.com/satyamsoni2211',
    website: 'https://satyamsoni.in'
  }
};

// Available commands
const COMMANDS = {
  help: 'Display available commands',
  ls: 'List sections or files in current directory',
  cd: 'Change to a section (e.g., cd projects)',
  cat: 'Display content of a file (e.g., cat about.txt)',
  clear: 'Clear the terminal screen',
  exit: 'Close the terminal session',
  whoami: 'Display user information',
  pwd: 'Show current directory',
  history: 'Show command history'
};

const SECTIONS: Record<string, Section> = {
  about: {
    name: 'about',
    description: 'Personal information and bio',
    content: (
      <div className="space-y-2">
        <div className="text-cyan-400 font-bold">=== ABOUT ME ===</div>
        <div className="text-green-400">Name: {PORTFOLIO_DATA.name}</div>
        <div className="text-green-400">Role: {PORTFOLIO_DATA.role}</div>
        <div className="text-green-400">Location: {PORTFOLIO_DATA.location}</div>
        <div className="text-green-300 mt-2 whitespace-pre-line">{PORTFOLIO_DATA.bio}</div>
      </div>
    )
  },
  education: {
    name: 'education',
    description: 'Educational background',
    content: (
      <div className="space-y-2">
        <div className="text-cyan-400 font-bold">=== EDUCATION ===</div>
        <div className="border-l-2 border-green-500 pl-3">
          <div className="text-yellow-400 font-bold">{PORTFOLIO_DATA.education.degree}</div>
          <div className="text-green-400">{PORTFOLIO_DATA.education.school}</div>
          <div className="text-green-400">{PORTFOLIO_DATA.education.location}</div>
          <div className="text-cyan-300">{PORTFOLIO_DATA.education.period}</div>
          <div className="text-yellow-400">GPA: {PORTFOLIO_DATA.education.gpa}</div>
        </div>
      </div>
    )
  },
  skills: {
    name: 'skills',
    description: 'Technical proficiencies',
    content: (
      <div className="space-y-3">
        <div className="text-cyan-400 font-bold">=== TECHNICAL SKILLS ===</div>
        <div>
          <div className="text-yellow-400 font-bold">[Programming Languages]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.languages.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[Frameworks & Libraries]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.frameworks.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[AI/ML]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.ai_ml.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[Databases]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.databases.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[DevOps & Tools]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.devops.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[Cloud Technologies]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.cloud.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[Version Control & Tools]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.tools.join(', ')}</div>
        </div>
        <div>
          <div className="text-yellow-400 font-bold">[Operating Systems]</div>
          <div className="text-green-300 ml-4">{PORTFOLIO_DATA.skills.os.join(', ')}</div>
        </div>
      </div>
    )
  },
  experience: {
    name: 'experience',
    description: 'Work history and roles',
    content: (
      <div className="space-y-4">
        <div className="text-cyan-400 font-bold">=== PROFESSIONAL EXPERIENCE ===</div>
        {PORTFOLIO_DATA.experience.map((exp, idx) => (
          <div key={idx} className="border-l-2 border-green-500 pl-3">
            <div className="text-yellow-400 font-bold">{exp.company}</div>
            <div className="text-cyan-300 text-sm">{exp.location}</div>
            <div className="text-green-400">{exp.role}</div>
            <div className="text-cyan-400 text-sm">{exp.period}</div>
            <div className="text-green-300 mt-1">{exp.description}</div>
            <div className="text-yellow-300 text-sm mt-1">Tech: {exp.technologies.join(', ')}</div>
          </div>
        ))}
      </div>
    )
  },
  projects: {
    name: 'projects',
    description: 'Featured projects showcase',
    content: (
      <div className="space-y-4">
        <div className="text-cyan-400 font-bold">=== FEATURED PROJECTS ===</div>
        {PORTFOLIO_DATA.projects.map((proj, idx) => (
          <div key={idx} className="border border-green-700 p-3 rounded">
            <div className="text-yellow-400 font-bold text-lg">{proj.name}</div>
            <div className="text-cyan-300 text-sm">{proj.company}</div>
            <div className="text-green-300 mt-1">{proj.description}</div>
            <div className="text-yellow-300 text-sm mt-2">Stack: {proj.tech.join(', ')}</div>
          </div>
        ))}
      </div>
    )
  },
  contact: {
    name: 'contact',
    description: 'Contact information',
    content: (
      <div className="space-y-3">
        <div className="text-cyan-400 font-bold">=== CONTACT INFORMATION ===</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">[Email]</span>
            <a 
              href={`mailto:${PORTFOLIO_DATA.contact.email}`}
              className="text-green-300 underline hover:text-white"
            >
              {PORTFOLIO_DATA.contact.email}
            </a>
          </div>
          {/* <div className="flex items-center gap-2">
            <span className="text-yellow-400">[Phone]</span>
            <span className="text-green-300">{PORTFOLIO_DATA.contact.phone}</span>
          </div> */}
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">[LinkedIn]</span>
            <a 
              href={PORTFOLIO_DATA.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 underline hover:text-white"
            >
              linkedin.com/in/-satyamsoni
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">[GitHub]</span>
            <a 
              href={PORTFOLIO_DATA.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 underline hover:text-white"
            >
              github.com/satyamsoni2211
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">[Website]</span>
            <a 
              href={PORTFOLIO_DATA.contact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 underline hover:text-white"
            >
              satyamsoni.in
            </a>
          </div>
        </div>
        <div className="mt-4 text-green-400 italic">
          Feel free to reach out for collaboration, consulting, or just to chat about AI and architecture!
        </div>
      </div>
    )
  }
};

const FILES: Record<string, { section: string; content: React.ReactNode }> = {
  'about.txt': {
    section: 'about',
    content: SECTIONS.about.content
  },
  'education.txt': {
    section: 'education',
    content: SECTIONS.education.content
  },
  'skills.txt': {
    section: 'skills',
    content: SECTIONS.skills.content
  },
  'experience.txt': {
    section: 'experience',
    content: SECTIONS.experience.content
  },
  'projects.txt': {
    section: 'projects',
    content: SECTIONS.projects.content
  },
  'contact.txt': {
    section: 'contact',
    content: SECTIONS.contact.content
  },
  'resume.pdf': {
    section: 'about',
    content: (
      <div className="text-yellow-400">
        [Resume PDF - Available on request via email]
      </div>
    )
  }
};

function App() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Boot sequence
  useEffect(() => {
    const bootLines = [
      'BIOS Date: 02/05/26 09:00:00 Ver 2.0.1',
      'CPU: Neural Processor @ 4.5GHz',
      'Memory Test: 131072K OK',
      '',
      'Loading kernel...',
      'Mounting root filesystem...',
      'Starting system services...',
      'Initializing AI modules...',
      'Loading LLM components...',
      'Done.',
      '',
      `Welcome to ${PORTFOLIO_DATA.name} Portfolio Terminal v3.0`,
      'Type "help" for available commands.',
      ''
    ];

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < bootLines.length) {
        setCommands(prev => [...prev, {
          input: '',
          output: <span className="text-green-400">{bootLines[lineIndex]}</span>,
          timestamp: new Date()
        }]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setShowBootSequence(false);
        setBootComplete(true);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands, currentInput]);

  // Focus input on click
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Process command
  const processCommand = useCallback((input: string) => {
    const trimmedInput = input.trim().toLowerCase();
    const args = trimmedInput.split(' ');
    const command = args[0];
    const arg = args[1];

    let output: React.ReactNode = null;
    let newDirectory = currentDirectory;

    switch (command) {
      case 'help':
      case '?':
        output = (
          <div className="space-y-1">
            <div className="text-cyan-400 font-bold">=== AVAILABLE COMMANDS ===</div>
            {Object.entries(COMMANDS).map(([cmd, desc]) => (
              <div key={cmd} className="flex gap-4">
                <span className="text-yellow-400 w-20">{cmd}</span>
                <span className="text-green-300">- {desc}</span>
              </div>
            ))}
            <div className="text-green-400 mt-2 text-sm">
              Tip: Use Tab for auto-completion, Up/Down for command history
            </div>
          </div>
        );
        break;

      case 'ls':
        if (currentDirectory === '~') {
          output = (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(SECTIONS).map(([name, section]) => (
                <div key={name} className="text-cyan-400">
                  <span className="text-yellow-400">📁</span> {name}/
                  <span className="text-green-600 text-sm ml-2">({section.description})</span>
                </div>
              ))}
              <div className="text-cyan-400"><span className="text-green-400">📄</span> about.txt</div>
              <div className="text-cyan-400"><span className="text-green-400">📄</span> education.txt</div>
              <div className="text-cyan-400"><span className="text-green-400">📄</span> skills.txt</div>
              <div className="text-cyan-400"><span className="text-green-400">📄</span> experience.txt</div>
              <div className="text-cyan-400"><span className="text-green-400">📄</span> projects.txt</div>
              <div className="text-cyan-400"><span className="text-green-400">📄</span> contact.txt</div>
              <div className="text-cyan-400"><span className="text-green-400">📄</span> resume.pdf</div>
            </div>
          );
        } else if (SECTIONS[currentDirectory]) {
          output = (
            <div className="text-green-300">
              Currently viewing: {SECTIONS[currentDirectory].description}
              <br />
              <span className="text-yellow-400">Use 'cd ..' to go back or 'cat [filename]' to view content</span>
            </div>
          );
        }
        break;

      case 'cd':
        if (!arg || arg === '~' || arg === '..') {
          newDirectory = '~';
          output = <span className="text-green-400">Returned to home directory</span>;
        } else if (arg === '.' ) {
          output = <span className="text-green-400">Already in {currentDirectory}</span>;
        } else if (SECTIONS[arg]) {
          newDirectory = arg;
          output = (
            <div>
              <span className="text-green-400">Navigated to {arg}/</span>
              <div className="mt-2">{SECTIONS[arg].content}</div>
            </div>
          );
        } else {
          output = <span className="text-red-400">Error: Directory '{arg}' not found. Use 'ls' to see available directories.</span>;
        }
        break;

      case 'cat':
        if (!arg) {
          output = <span className="text-red-400">Error: Please specify a file. Usage: cat [filename]</span>;
        } else if (FILES[arg]) {
          output = FILES[arg].content;
        } else {
          output = <span className="text-red-400">Error: File '{arg}' not found. Use 'ls' to see available files.</span>;
        }
        break;

      case 'clear':
      case 'cls':
        setCommands([]);
        setCurrentDirectory('~');
        setHistoryIndex(-1);
        return;

      case 'exit':
      case 'logout':
        output = (
          <div className="space-y-2">
            <div className="text-yellow-400">Closing session...</div>
            <div className="text-green-400">Thank you for visiting!</div>
            <div className="text-cyan-400 mt-2">
              Redirecting to{' '}
              <a 
                href={PORTFOLIO_DATA.contact.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-white"
              >
                GitHub Profile
              </a>
            </div>
          </div>
        );
        setTimeout(() => {
          window.open(PORTFOLIO_DATA.contact.github, '_blank');
        }, 2000);
        break;

      case 'whoami':
        output = (
          <div className="space-y-1">
            <div className="text-green-400">{PORTFOLIO_DATA.name}</div>
            <div className="text-cyan-400">{PORTFOLIO_DATA.role}</div>
            <div className="text-green-300">9+ years experience | AI & Cloud Architecture</div>
            <div className="text-yellow-400">{PORTFOLIO_DATA.location}</div>
          </div>
        );
        break;

      case 'pwd':
        output = <span className="text-green-400">/home/guest/{currentDirectory}</span>;
        break;

      case 'history':
        output = (
          <div className="space-y-1">
            {commandHistory.map((cmd, idx) => (
              <div key={idx} className="text-green-300">
                <span className="text-yellow-400">{idx + 1}</span> {cmd}
              </div>
            ))}
          </div>
        );
        break;

      case '':
        output = null;
        break;

      default:
        output = (
          <span className="text-red-400">
            Command not found: '{command}'. Type 'help' for available commands.
          </span>
        );
    }

    setCommands(prev => [...prev, {
      input: trimmedInput,
      output,
      timestamp: new Date()
    }]);

    if (trimmedInput) {
      setCommandHistory(prev => [...prev, trimmedInput]);
    }
    setHistoryIndex(-1);
    setCurrentDirectory(newDirectory);
  }, [currentDirectory, commandHistory]);

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      const input = currentInput.toLowerCase();
      const allOptions = [
        ...Object.keys(COMMANDS),
        ...Object.keys(SECTIONS),
        ...Object.keys(FILES)
      ];
      const matches = allOptions.filter(opt => opt.startsWith(input));
      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      } else if (matches.length > 1) {
        setSuggestions(matches);
        setShowSuggestions(true);
      }
      return;
    }

    // Hide suggestions on other keys
    setShowSuggestions(false);

    // Command history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
      return;
    }

    // Submit command
    if (e.key === 'Enter') {
      processCommand(currentInput);
      setCurrentInput('');
    }
  }, [currentInput, commandHistory, historyIndex, processCommand]);

  // Quick navigation buttons
  const quickNav = (section: string) => {
    processCommand(`cd ${section}`);
  };

  return (
    <div 
      className="min-h-screen bg-black text-green-400 font-mono p-2 md:p-4"
      onClick={focusInput}
    >
      {/* Terminal Window */}
      <div className="max-w-6xl mx-auto border-2 border-green-500 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(0,255,0,0.3)]">
        {/* Terminal Header */}
        <div className="bg-green-900/30 border-b-2 border-green-500 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-green-400 text-sm md:text-base">
            satyam@portfolio: {currentDirectory}
          </div>
          <div className="text-green-600 text-xs">
            UTF-8
          </div>
        </div>

        {/* Terminal Body */}
        <div 
          ref={terminalRef}
          className="bg-black p-4 h-[70vh] md:h-[80vh] overflow-y-auto terminal-scanline"
        >
          {/* Command History */}
          {commands.map((cmd, idx) => (
            <div key={idx} className="mb-2">
              {cmd.input && (
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">satyam@portfolio:{currentDirectory}$</span>
                  <span className="text-green-300">{cmd.input}</span>
                </div>
              )}
              {cmd.output && (
                <div className="mt-1 ml-0 md:ml-4">
                  {cmd.output}
                </div>
              )}
            </div>
          ))}

          {/* Current Input Line */}
          {!showBootSequence && bootComplete && (
            <div className="flex items-start">
              <span className="text-green-500 mr-2">satyam@portfolio:{currentDirectory}$</span>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-green-300 outline-none border-none font-mono"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal input"
                />
                {/* Blinking cursor when empty */}
                {currentInput === '' && (
                  <span className="absolute left-0 top-0 w-2 h-5 bg-green-400 terminal-cursor"></span>
                )}
              </div>
            </div>
          )}

          {/* Auto-complete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 p-2 bg-green-900/20 border border-green-700 rounded">
              <div className="text-yellow-400 text-sm mb-1">Suggestions:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sugg, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentInput(sugg);
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className="px-2 py-1 bg-green-800/50 text-green-300 rounded hover:bg-green-700/50 text-sm"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Navigation Footer */}
        <div className="bg-green-900/20 border-t-2 border-green-500 p-3">
          <div className="text-green-600 text-xs mb-2">Quick Navigation (click to navigate):</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SECTIONS).map((section) => (
              <button
                key={section}
                onClick={() => quickNav(section)}
                className="px-3 py-1 bg-green-800/30 border border-green-600 text-green-400 rounded text-sm hover:bg-green-700/50 hover:text-white transition-colors"
              >
                {section}
              </button>
            ))}
            <button
              onClick={() => processCommand('help')}
              className="px-3 py-1 bg-cyan-800/30 border border-cyan-600 text-cyan-400 rounded text-sm hover:bg-cyan-700/50 hover:text-white transition-colors"
            >
              help
            </button>
            <button
              onClick={() => processCommand('clear')}
              className="px-3 py-1 bg-yellow-800/30 border border-yellow-600 text-yellow-400 rounded text-sm hover:bg-yellow-700/50 hover:text-white transition-colors"
            >
              clear
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="max-w-6xl mx-auto mt-4 flex flex-wrap justify-between items-center text-xs text-green-600">
        <div>
          <span className="text-green-500">Status:</span> Online | 
          <span className="text-green-500"> Location:</span> {PORTFOLIO_DATA.location} |
          <span className="text-green-500"> Time:</span> {new Date().toLocaleTimeString()}
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a 
            href={PORTFOLIO_DATA.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors"
          >
            [GitHub]
          </a>
          <a 
            href={PORTFOLIO_DATA.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors"
          >
            [LinkedIn]
          </a>
          <a 
            href={PORTFOLIO_DATA.contact.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-green-400 transition-colors"
          >
            [Website]
          </a>
          <a 
            href={`mailto:${PORTFOLIO_DATA.contact.email}`}
            className="hover:text-green-400 transition-colors"
          >
            [Email]
          </a>
        </div>
      </div>

      {/* CRT Overlay Effect */}
      <div className="fixed inset-0 pointer-events-none crt-overlay z-50"></div>
    </div>
  );
}

export default App;
