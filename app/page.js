import { personalData } from "@/utils/data/personal-data";
import AboutSection from "./components/homepage/about";
import Blog from "./components/homepage/blog";
import ContactSection from "./components/homepage/contact";
import Education from "./components/homepage/education";
import Experience from "./components/homepage/experience";
import HeroSection from "./components/homepage/hero-section";
import Projects from "./components/homepage/projects";
import Skills from "./components/homepage/skills";
import BlurOnScroll from "./components/helper/blur";

async function getData() {
  const res = await fetch(
    `https://dev.to/api/articles?username=${personalData.devUsername}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await res.json();

  const filtered = data
    .filter((item) => item?.cover_image)
    .sort(() => Math.random() - 0.5);

  return filtered;
}

export default async function Home() {
  const blogs = await getData();

  return (
    <>
      <BlurOnScroll>
        <HeroSection />
      </BlurOnScroll>
      <BlurOnScroll>
        <AboutSection />
      </BlurOnScroll>
      <Experience />
      <BlurOnScroll name="Skills">
        <Skills />
      </BlurOnScroll>
      <Projects />
      <BlurOnScroll name="Education" isBug>
        <Education />
      </BlurOnScroll>
      <BlurOnScroll>
        <Blog blogs={blogs} />
      </BlurOnScroll>
      <BlurOnScroll>
        <ContactSection />
      </BlurOnScroll>
    </>
  );
}
