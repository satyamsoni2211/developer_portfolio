import { projectsData } from "@/utils/data/projects-data";
import ProjectCard from "./project-card";
import BlurOnScroll from "../../helper/blur";

const Projects = () => {
  return (
    <div id="projects" className="relative z-50  my-12 lg:my-24">
      <div className="sticky top-10">
        <div className="w-[80px] h-[80px] bg-violet-100 rounded-full absolute -top-3 left-0 translate-x-1/2 filter blur-3xl  opacity-30"></div>
        <div className="flex items-center justify-start relative">
          <span className="bg-[#1a1443] absolute left-0  w-fit text-white px-5 py-3 text-xl rounded-md">
            PROJECTS
          </span>
          <span className="w-full h-[2px] bg-[#1a1443]"></span>
        </div>
      </div>

      <div className="pt-24">
        <div className="flex flex-col gap-6">
          {projectsData.slice(0, 4).map((project, index) => (
            <BlurOnScroll key={index} name={project.name} isBig>
              <div
                id={`sticky-card-${index + 1}`}
                key={index}
                className="sticky-card w-full mx-auto max-w-2xl sticky"
              >
                <div className="box-border flex items-center justify-center rounded shadow-[0_0_30px_0_rgba(0,0,0,0.3)] transition-all duration-[0.5s]">
                  <ProjectCard project={project} />
                </div>
              </div>
            </BlurOnScroll>
          ))}
        </div>
      </div>
      <BlurOnScroll>
        <div className="pt-24 w-full ">
          <p className="text-center font-sans text-2xl antialiased">
            And many more projects ...
          </p>
          <div className="h-[1px] w-1/2 m-auto mt-2 bg-gradient-to-r from-pink-500 transform translate-x-[1px] to-blue-500"></div>
        </div>
      </BlurOnScroll>
    </div>
  );
};

export default Projects;
