import lazyalchemy from "/public/image/lazyalchemy.png";
import reporting from "/public/image/reporting.png";
import tool_suite from "/public/image/tool_suite.png";
export const projectsData = [
    {
        id: 1,
        name: 'GSLogger - Logging Utility Abstraction',
        description: "Centralised Python based Utility Framework for logging, dockerizing, terraform management, notifications and much more.",
        tools: ['Python','Thread','Requests'],
        role: 'Lead Full Stack Developer',
        code: '',
        demo: null,
        image: null,
    },
    {
        id: 2,
        name: 'LazyAlchemy',
        description: "Python based ORM for SQLAlchemy with lazy loading and caching tables to optimise applications. Works well with Flask and FastApi.",
        tools: ['Python','SQLAlchemy'],
        role: 'Lead BackEnd Developer',
        code: '',
        demo: 'https://pypi.org/project/lazy-alchemy/',
        image: lazyalchemy,
    },
    {
        id: 3,
        name: 'Reporting Tool',
        description: "Python and VueJs based reporting tool for generating and floating pdf reports to real estate clients.",
        tools: ['Python','SQLAlchemy','VueJs','FastApi','Docker','SES','S3','RDS','ECS','EBS','CodeArtifact','Single-Spa','Pinia'],
        role: 'Lead Full Stack Developer',
        code: '',
        demo: null,
        image: reporting,
    },
    {
        id: 4,
        name: 'Tool Suite',
        description: "Python and VueJs based Micro-FrontEnd Suite container for tools providing common authentication and authorisation across tools.",
        tools: ['Python','SQLAlchemy','VueJs','FastApi','Docker','SES','S3','RDS','ECS','EBS','CodeArtifact','Single-Spa','Pinia'],
        role: 'Lead Full Stack Developer',
        code: '',
        demo: null,
        image: tool_suite,
    },
    {
        id: 5,
        name: 'Automatic Certificate Renewal',
        description: " Python Django, React, and MongoDB-based tool for automatic certificate renewal and refreshing on servers, using Ansible and Celery.",
        tools: ['Python','React','Django','Docker','Go','Ansible','Celery','MongoDB'],
        role: 'Lead Full Stack Developer',
        code: '',
        demo: null,
        image: null,
    },
    
];


// Do not remove any property.
// Leave it blank instead as shown below

// {
//     id: 1,
//     name: '',
//     description: "",
//     tools: [],
//     role: '',
//     code: '',
//     demo: '',
//     image: crefin,
// },