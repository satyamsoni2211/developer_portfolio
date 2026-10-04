import type { SkillCategory } from './types'

export const skillCategories: SkillCategory[] = [
  { id: 'languages', label: 'Programming Languages', items: ['Python', 'Golang', 'C#', 'TypeScript', 'NodeJS', 'Rust', 'Shell Scripting', 'SQL'] },
  { id: 'frameworks', label: 'Frameworks & Libraries', items: ['Django', 'FastAPI', 'Flask', 'PySpark', 'ReactJS', 'Angular', 'Vue.js', '.Net Core', 'Gin', 'Gorm', 'GRPC', 'Tauri', 'Celery'] },
  { id: 'ai_ml', label: 'AI / ML', items: ['Scikit-learn', 'NumPy', 'Pandas', 'PyTorch', 'LangChain', 'OpenAI', 'GraphRAG', 'LLM Integration', 'OpenCV', 'Ultralytics YOLO', 'MediaPipe'] },
  { id: 'databases', label: 'Databases', items: ['MySQL', 'MongoDB', 'PostgreSQL', 'Elasticsearch', 'Redis', 'SQLite', 'Neo4j'] },
  { id: 'devops', label: 'DevOps & Tools', items: ['Docker', 'Kubernetes', 'Terraform', 'Apache Airflow', 'MWAA', 'Swagger'] },
  { id: 'cloud', label: 'Cloud Technologies', items: ['AWS (EC2, S3, RDS, Lambda)', 'ECS', 'SQS', 'Cloud-Native Architecture'] },
  { id: 'tools', label: 'Version Control & Tools', items: ['GIT', 'BitBucket', 'JIRA', 'Confluence', 'SharePoint'] },
  { id: 'os', label: 'Operating Systems', items: ['Windows', 'Linux', 'Unix', 'Mac'] },
]

export const marqueeSkills = [
  'Python', 'FastAPI', 'Golang', 'React', 'TypeScript', 'PyTorch', 'LangChain', 'GraphRAG', 'OpenCV',
  'YOLO', 'MediaPipe', 'AWS', 'Kubernetes', 'Terraform', 'Airflow', 'PostgreSQL', 'Docker', 'Rust',
]
