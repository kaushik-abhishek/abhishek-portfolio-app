// Skills Section Logo's
import angularLogo from './assets/tech_logo/angular.png';
import bootstrapLogo from './assets/tech_logo/bootstrap.png';
import cppLogo from './assets/tech_logo/cpp.png';
import cssLogo from './assets/tech_logo/css.png';
import expressjsLogo from './assets/tech_logo/express.png';
import figmaLogo from './assets/tech_logo/figma.png';
import firebaseLogo from './assets/tech_logo/firebase.png';
import gitLogo from './assets/tech_logo/git.png';
import githubLogo from './assets/tech_logo/github.png';
import gsapLogo from './assets/tech_logo/gsap.png';
import htmlLogo from './assets/tech_logo/html.png';
import javaLogo from './assets/tech_logo/java.png';
import javascriptLogo from './assets/tech_logo/javascript.png';
import materialuiLogo from './assets/tech_logo/materialui.png';
import mcLogo from './assets/tech_logo/mc.png';
import mongodbLogo from './assets/tech_logo/mongodb.png';
import mysqlLogo from './assets/tech_logo/mysql.png';
import netlifyLogo from './assets/tech_logo/netlify.png';
import nextjsLogo from './assets/tech_logo/nextjs.png';
import nodejsLogo from './assets/tech_logo/nodejs.png';
import postgreLogo from './assets/tech_logo/postgre.png';
import postmanLogo from './assets/tech_logo/postman.png';
import reactjsLogo from './assets/tech_logo/reactjs.png';
import reduxLogo from './assets/tech_logo/redux.png';
import sassLogo from './assets/tech_logo/sass.png';
import tailwindcssLogo from './assets/tech_logo/tailwindcss.png';
import typescriptLogo from './assets/tech_logo/typescript.png';
import vercelLogo from './assets/tech_logo/vercel.png';
import vscodeLogo from './assets/tech_logo/vscode.png';


// Experience Section Logo's
import wiproLogo from './assets/company_logo/wipro_logo.png';

// Education Section Logo's
import jmietiLogo from './assets/education_logo/jmietiLogo.png';
import mlnLogo from './assets/education_logo/mlnLogo.png';
import avmLogo from './assets/education_logo/avmLogo.png';

export const SkillsInfo = [
  {
    title: 'Frontend',
    skills: [
      { name: 'HTML', logo: htmlLogo },
      { name: 'CSS', logo: cssLogo },
      { name: 'SASS', logo: sassLogo },
      { name: 'JavaScript', logo: javascriptLogo },
      { name: 'React JS', logo: reactjsLogo },
      { name: 'Angular', logo: angularLogo },
      { name: 'Redux', logo: reduxLogo },
      { name: 'Next JS', logo: nextjsLogo },
      { name: 'Tailwind CSS', logo: tailwindcssLogo },
      { name: 'GSAP', logo: gsapLogo },
      { name: 'Material UI', logo: materialuiLogo },
      { name: 'Bootstrap', logo: bootstrapLogo },
    ],
  },
  {
    title: 'Backend',
    skills: [
      { name: 'Node JS', logo: nodejsLogo },
      { name: 'Express JS', logo: expressjsLogo },
      { name: 'MySQL', logo: mysqlLogo },
      { name: 'MongoDB', logo: mongodbLogo },
      { name: 'Firebase', logo: firebaseLogo },
      { name: 'PostgreSQL', logo: postgreLogo },
    ],
  },
  {
    title: 'Languages',
    skills: [
      { name: 'C++', logo: cppLogo },
      { name: 'Java', logo: javaLogo },
      { name: 'JavaScript', logo: javascriptLogo },
      { name: 'TypeScript', logo: typescriptLogo },
    ],
  },
  {
    title: 'Tools',
    skills: [
      { name: 'Git', logo: gitLogo },
      { name: 'GitHub', logo: githubLogo },
      { name: 'VS Code', logo: vscodeLogo },
      { name: 'Postman', logo: postmanLogo },
      { name: 'Compass', logo: mcLogo },
      { name: 'Vercel', logo: vercelLogo },
      { name: 'Netlify', logo: netlifyLogo },
      { name: 'Figma', logo: figmaLogo },
    ],
  },
];


export const experiences = [
  {
    id: 0,
    img: wiproLogo,
    role: "Fullstack Developer",
    company: "Wipro Technologies",
    date: "Dec 2021 - Present",
    desc: "Developed dynamic and scalable web applications using the MERN stack, handling both frontend and backend development. Collaborated with cross-functional teams to build responsive UI, implement RESTful APIs, and optimize application performance in an agile environment.",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React JS",
      "TypeScript",
      "Node JS",
      "Tailwind CSS",
      "MongoDb",
      "Redux",
      "Next Js",
      "AWS",
      "JIRA",
      "Bitbucket",
      "Jenkins",
      "PostgreSQL",
      "Express JS",
      "Git",
      "GitHub",
      "Figma",
      "Postman",
      "Material UI",
    ],
  },
];


  export const education = [
    {
      id: 0,
      img: jmietiLogo,
      school: "Jai Prakash Mukand Lal Innvoative Engineering & Technology Institue, Yamunanagar",
      date: "Aug 2017 - July 2021",
      grade: "70%",
      desc: "I completed my Bachelor's degree in Computer Science (B.Tech.) from JMIETI, Yamunanagar (HR). Throughout my studies, I was immersed in a variety of subjects that deepened my understanding of computing and technology. From exploring Data Structures and Algorithms to diving into Web Development and Database Management Systems, I gained practical insights into the world of software development. My time at BSA College allowed me to work on projects that applied theoretical concepts to real-world problems.",
      degree: "Bachelor of Technology - BTech (Computer Science)",
    },
    {
      id: 1,
      img: mlnLogo,
      school: "Mukand Lal National Senior Secondary School",
      date: "Apr 2015 - March 2017",
      grade: "79%",
      desc: "I completed my class 12 education from Mukand Lal National Senior Secondary School, Yamunanagar, under the HBSE board, where I studied Physics, Chemistry, and Mathematics (PCM) with Computer Science.",
      degree: "HBSE(XII) - PCM with Computer Science",
    },
    {
      id: 2,
      img: avmLogo,
      school: "Adarsh Vidya Mandir Senior Secondary School",
      date: "Apr 2004 - March 2015",
      grade: "88.4%",
      desc: "I completed my class 10 education from Adarsh Vidya Mandir Senior Secondary School, Yamunanagar, under the HBSE board, where I studied Science, Math with Computer.",
      degree: "HBSE(X), Science, Math with Computer Application",
    },
  ];